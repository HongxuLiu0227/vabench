import argparse
import os

os.environ['HF_ENDPOINT'] = 'https://hf-mirror.com'

import shutil
import traceback
import cv2
import glob
import numpy as np
import torch
import torch.nn.functional as F
import open_clip
from PIL import Image
from skimage.metrics import structural_similarity as ssim
from sacrebleu.metrics import BLEU
from bs4 import BeautifulSoup
from scipy.ndimage import gaussian_filter

# ----------------- Image Metrics -----------------
class ImageMetrics:
    def __init__(self, clip_model_name='ViT-B-32', pretrained='laion2b_s34b_b79k'):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"[ImageMetrics] Loading CLIP model {clip_model_name} on {self.device}...")
        self.clip_model, _, self.clip_preprocess = open_clip.create_model_and_transforms(
            clip_model_name, pretrained=pretrained
        )
        self.clip_model.to(self.device)
        self.clip_model.eval()

    def calculate_clip_similarity(self, img1_path: str, img2_path: str) -> float:
        img1 = Image.open(img1_path).convert('RGB')
        img2 = Image.open(img2_path).convert('RGB')
        img1_input = self.clip_preprocess(img1).unsqueeze(0).to(self.device)
        img2_input = self.clip_preprocess(img2).unsqueeze(0).to(self.device)
        with torch.no_grad():
            feat1 = self.clip_model.encode_image(img1_input)
            feat2 = self.clip_model.encode_image(img2_input)
            feat1 = F.normalize(feat1, dim=-1)
            feat2 = F.normalize(feat2, dim=-1)
            similarity = (feat1 * feat2).sum(dim=-1).item()
        return similarity

    def calculate_ssim(self, img1_path: str, img2_path: str, win_size=11) -> float:
        img1 = cv2.imread(img1_path)
        img2 = cv2.imread(img2_path)
        if img1 is None or img2 is None:
            raise FileNotFoundError("Image not found.")
        img1 = cv2.cvtColor(img1, cv2.COLOR_BGR2RGB)
        img2 = cv2.cvtColor(img2, cv2.COLOR_BGR2RGB)
        if img1.shape != img2.shape:
            raise ValueError(f"Viewport Mismatch! {img1.shape} vs {img2.shape}.")
        score, _ = ssim(img1, img2, channel_axis=2, full=True, data_range=255, win_size=win_size, gaussian_weights=True, sigma=1.5)
        return score

    def calculate_mse(self, img1_path: str, img2_path: str, blur_sigma=2.0) -> float:
        img1 = cv2.imread(img1_path)
        img2 = cv2.imread(img2_path)
        img1 = cv2.cvtColor(img1, cv2.COLOR_BGR2RGB).astype(np.float32)
        img2 = cv2.cvtColor(img2, cv2.COLOR_BGR2RGB).astype(np.float32)
        if img1.shape != img2.shape:
            raise ValueError(f"Viewport Mismatch! {img1.shape} vs {img2.shape}.")
        if blur_sigma > 0:
            img1 = gaussian_filter(img1, sigma=(blur_sigma, blur_sigma, 0))
            img2 = gaussian_filter(img2, sigma=(blur_sigma, blur_sigma, 0))
        mse = np.mean(((img1 - img2) / 255.0) ** 2)
        return 1.0 - float(mse)

# ----------------- Code Metrics -----------------
class CodeMetrics:
    def __init__(self):
        self.bleu_scorer = BLEU(effective_order=True)

    def _get_dom_tree_seq(self, html_content: str) -> str:
        try:
            soup = BeautifulSoup(html_content, 'lxml')
        except Exception:
            soup = BeautifulSoup(html_content, 'html.parser')
        seq = []
        def dfs(node):
            if hasattr(node, 'name') and node.name:
                seq.append(f"<{node.name}>")
                for child in node.children:
                    dfs(child)
                seq.append(f"</{node.name}>")
        dfs(soup)
        return " ".join(seq)

    def calculate_treebleu(self, pred_html: str, gt_html: str) -> float:
        pred_seq = self._get_dom_tree_seq(pred_html)
        gt_seq = self._get_dom_tree_seq(gt_html)
        return self.bleu_scorer.sentence_score(pred_seq, [gt_seq]).score / 100.0

def get_all_code(directory):
    content = []
    for filepath in glob.glob(os.path.join(directory, 'src', '**', '*.tsx'), recursive=True):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content.append(f.read())
        except:
            pass
    return "\n".join(content)

# ----------------- Batch Evaluator -----------------
def run_batch_evaluation(base_dir: str, gt_base_dir: str):
    export_dir = os.path.join(base_dir, 'exported_images_collection')
    os.makedirs(export_dir, exist_ok=True)
    
    project_dirs = [d for d in os.listdir(base_dir) 
                    if os.path.isdir(os.path.join(base_dir, d)) and d.startswith('tableau_dashboard')]
    
    print("Initializing Metrics...")
    image_metrics = ImageMetrics()
    code_metrics = CodeMetrics()
    
    total_ssim, total_mse, total_clip, total_treebleu = 0.0, 0.0, 0.0, 0.0
    successful_count = 0
    N = len(project_dirs)
    print(f"Total projects found: {N}")
    
    log_lines = []
    log_lines.append(f"Total projects found: {N}")
    
    for p in project_dirs:
        print(f"\nProcessing: {p}")
        pred_dir = os.path.join(base_dir, p)
        gt_dir = os.path.join(gt_base_dir, p)
        
        pred_path = os.path.join(pred_dir, 'docs', 'result.png')
        gt_path = os.path.join(pred_dir, 'docs', 'image.png')
        
        ssim_score, clip_score, tree_bleu = 0.0, 0.0, 0.0
        mse_score = 0.0
        
        has_result = os.path.exists(pred_path)
        ex_score = 1 if has_result else 0
        has_gt = os.path.exists(gt_path)
        
        if has_result and has_gt:
            shutil.copy(pred_path, os.path.join(export_dir, f"{p}_result.png"))
            shutil.copy(gt_path, os.path.join(export_dir, f"{p}_image.png"))
            try:
                img_pred = cv2.imread(pred_path)
                img_gt = cv2.imread(gt_path)
                
                gt_resized_path = os.path.join(pred_dir, 'docs', 'image_resized.png')
                if img_pred.shape != img_gt.shape:
                    img_gt_resized = cv2.resize(img_gt, (img_pred.shape[1], img_pred.shape[0]))
                    cv2.imwrite(gt_resized_path, img_gt_resized)
                    gt_path_to_use = gt_resized_path
                else:
                    gt_path_to_use = gt_path
                    
                ssim_score = image_metrics.calculate_ssim(pred_path, gt_path_to_use)
                mse_score = image_metrics.calculate_mse(pred_path, gt_path_to_use)
                clip_score = image_metrics.calculate_clip_similarity(pred_path, gt_path_to_use)
            except Exception as e:
                print(f"  [Image Error] {e}")
        else:
            print(f"  Missing images! GT found: {has_gt}, Result found: {has_result}, skipping 4 metrics.")
            
        if os.path.exists(pred_dir) and os.path.exists(gt_dir) and has_result:
            pred_code = get_all_code(pred_dir)
            gt_code = get_all_code(gt_dir)
            if pred_code and gt_code:
                try:
                    tree_bleu = code_metrics.calculate_treebleu(pred_code, gt_code)
                except Exception as e:
                    print(f"  [Code Error] {e}")
            else:
                print("  Missing code for TreeBLEU.")
        else:
             if not has_result:
                 print("  No result.png, skipping TreeBLEU.")
        
        if has_result:
            successful_count += 1
            total_ssim += ssim_score
            total_mse += mse_score
            total_clip += clip_score
            total_treebleu += tree_bleu
            log_str = f"  -> Project: {p} | Ex: {ex_score} | SSIM: {ssim_score:.4f} | 1-MSE: {mse_score:.4f} | CLIP: {clip_score:.4f} | TreeBLEU: {tree_bleu:.4f}"
        else:
            log_str = f"  -> Project: {p} | Ex: {ex_score} | SSIM: N/A | 1-MSE: N/A | CLIP: N/A | TreeBLEU: N/A"
            
        print(log_str)
        log_lines.append(log_str)

    if N > 0:
        avg_ex = successful_count / N
        avg_ssim = (total_ssim / successful_count) if successful_count > 0 else 0
        avg_mse_inv = (total_mse / successful_count) if successful_count > 0 else 0
        avg_clip = (total_clip / successful_count) if successful_count > 0 else 0
        avg_treebleu = (total_treebleu / successful_count) if successful_count > 0 else 0
        overall_score = (avg_ssim + avg_mse_inv + avg_clip + avg_treebleu) / 4

        final_summary = []
        final_summary.append("\n" + "="*45)
        final_summary.append("    FINAL AVERAGE SCORES ACROSS ALL TASKS")
        final_summary.append("="*45)
        final_summary.append(f" Total Projects : {N}")
        final_summary.append(f" Failed Projects: {N - successful_count} (Missing result.png)")
        final_summary.append(f" ALL_Ex         : {avg_ex:.4f}  (成功生成率)")
        final_summary.append(f" ALL_SSIM       : {avg_ssim:.4f}  (越大越好 0~1)")
        final_summary.append(f" ALL_1-MSE      : {avg_mse_inv:.4f}  (越大越好 0~1)")
        final_summary.append(f" ALL_CLIP       : {avg_clip:.4f}  (越大越好 常在0~1)")
        final_summary.append(f" ALL_TreeBLEU   : {avg_treebleu:.4f}  (越大越好 0~1)")
        final_summary.append("-" * 45)
        final_summary.append(f" OVERALL SCORE  : {overall_score:.4f}  (仅计算成功项目的四大指标均值)")
        final_summary.append("="*45)
        
        for line in final_summary:
            print(line)
            log_lines.append(line)
            
        log_file_path = os.path.join(base_dir, 'evaluation_details.txt')
        with open(log_file_path, 'w', encoding='utf-8') as f:
            f.write("\n".join(log_lines) + "\n")
        print(f"\nDetailed logs saved to: {log_file_path}")
        print(f"Images copied to: {export_dir}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Evaluate Image-to-Code metrics for all projects in a directory.")
    parser.add_argument("--base-dir", type=str, default="/root/autodl-tmp/chi26-image2code/generation-app", help="Path to generations")
    parser.add_argument("--gt-dir", type=str, default="/root/autodl-tmp/chi26-image2code/generated-react-app", help="Path to GT projects")
    args = parser.parse_args()
    
    run_batch_evaluation(args.base_dir, args.gt_dir)
