import os
import sys
import random
import json
import argparse
import itertools
from typing import Dict, List, Optional
from dotenv import load_dotenv
import openai

# Add parent directory to path to import llm_output_utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from llm_output_utils import get_complete_llm_response_for_text


load_dotenv()
api_key = os.getenv("LLM_KEY")
model = os.getenv("MODEL_NAME")
base_url = os.getenv("LLM_BASE_URL")

if not api_key:
    print("[Code Fixer Agent] ERROR: LLM_KEY not found in .env")

# Create OpenAI client
if base_url:
    client = openai.OpenAI(api_key=api_key, base_url=base_url)
else:
    client = openai.OpenAI(api_key=api_key)

POOL_LIMIT = 30

# Exhaustive taxonomy provided by the user for grid generation
DOMAIN_TYPES = [
    "房地产/房产交易",
    "企业服务/B端系统",
    "电商/零售",
    "金融/支付",
    "教育/培训",
    "智能硬件/IoT",
    "社交/社区",
    "医疗/健康",
    "文旅/娱乐",
    "生活",
    "其他/未明确",
]

FUNCTIONALITY_TYPES = [
    "门户首页/导航",
    "后台管理系统",
    "数据可视化",
    "交易/支付流程",
    "营销/推广",
    "工具类界面",
    "互动/娱乐体验",
    "内容阅读与消费",
    "用户中心",
    "搜索与列表",
    "详情",
    "沟通与社交",
    "注册与登录",
]

STYLE_TYPES = [
    "简约/现代风",
    "科技感/未来风",
    "企业级/B端风格",
    "复古/波普风",
    "拟物/写实风",
    "卡通/趣味风",
    "插画风",
    "其他",
]

DEVICE_TYPES = ["PC", "mobile"]


def read_seeds_from_file(file_path="seeds.txt"):
    """Read initial requirements from seeds.txt file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            seeds = [line.strip() for line in f if line.strip()]
        return seeds
    except FileNotFoundError:
        print(f"Seeds file {file_path} not found. Starting with empty pool.")
        return []


def get_requirement_combinations() -> List[Dict[str, str]]:
    """Return the cartesian product of Domain*Functionality*Style*Device."""
    combos = []
    for domain, functionality, style, device in itertools.product(
        DOMAIN_TYPES, FUNCTIONALITY_TYPES, STYLE_TYPES, DEVICE_TYPES
    ):
        combos.append(
            {
                "domain": domain,
                "functionality": functionality,
                "style": style,
                "device": device,
            }
        )
    return combos


def generate_new_requirement(sampled_requirements):
    """Generate a new requirement based on 3 sampled requirements"""
    prompt = f"""
You will receive **exactly three** existing web app requirements (the *seeds*). Your task is to create **one brand‑new web app requirement** that differs substantially from all seeds while still fitting within the broad landscape of common web‑app categories (e.g., e‑commerce, finance, collaboration, IoT, health, travel, education, social, etc.).

---

**Objective**
Generate a concise, standalone requirement (120-150 words) that a PM could immediately use as a starting point for a detailed requirement description of a new web app.

---

**Uniqueness Rules**

1. **Primary Scenario** Choose a usage scenario **not already covered** by any of the three seeds.
2. **Core Features** Do **not** copy or lightly rephrase seed features; introduce at least **two fresh key functionalities**.
3. **Overlap Threshold**No more than 30 % of the wording or functional scope can overlap with any single seed.

---

**Requirement Structure**

* State the **target scenarios**.
* List the **major capabilities** (3‑5) in flowing prose, **comma‑separated** rather than bullet points.
* Mention **routing pattern** or **state‑management note** (e.g., “client‑side routing such as `/dashboard` …”).
* End within 150 words; no bullets, headers, or commentary.

---

**Formatting & Output**
* Return **only** the new requirement text—no explanations, no seed references, no markdown, or any other text.

---

**Example Output Format (do *not* reuse this idea)**

Please generate a web app for a peer‑to‑peer book‑exchange network where users list textbooks, negotiate swaps in real time, rate each trade, view personal libraries via `/shelf`, and manage exchange calendars, using client‑side state with Zustand and instant chat updates.

Three Input Requirements for inspiration:
1. {sampled_requirements[0]}
2. {sampled_requirements[1]}
3. {sampled_requirements[2]}

New Requirement:
"""

    messages = [{"role": "user", "content": prompt}]
    
    try:
        response = get_complete_llm_response_for_text(messages, model, client, max_attempts=1, max_tokens=4096)
        # Extract the requirement text (remove any extra formatting)
        new_requirement = response.strip()
        return new_requirement
    except Exception as e:
        print(f"Error generating new requirement: {e}")
        return None


def generate_requirement_for_combination(combination: Dict[str, str]) -> Optional[str]:
    """Generate a requirement that respects an explicit domain/functionality/style/device combo."""
    prompt = f"""
你将获得一个Web应用需求组合，包含行业Domain、核心Functionality、视觉Style以及目标Device。

---

**任务**
请围绕该组合撰写一段全新Web产品需求（120-150英文单词），需要满足：
1. 背景/痛点要贴合Domain场景。
2. 重点功能必须覆盖给定的Functionality维度，并补充2-3个互补特性。
3. 描述中要体现Style带来的体验或界面特征。
4. 清楚指出主要Device并解释为何设计为该端（如交互方式、布局等）。
5. 包含至少一个路由或状态管理提示，例如“route `/dashboard`”或“use Zustand for state”。
6. 输出为一段英文长句/短段落，不要使用列表或额外说明。

---

组合：
- Domain: {combination['domain']}
- Functionality: {combination['functionality']}
- Style: {combination['style']}
- Device: {combination['device']}

返回仅包含最终需求描述。
"""

    messages = [{"role": "user", "content": prompt}]

    try:
        response = get_complete_llm_response_for_text(
            messages, model, client, max_attempts=1, max_tokens=4096
        )
        return response.strip()
    except Exception as e:
        print(f"Error generating requirement for combination {combination}: {e}")
        return None


def judge_similarity(new_requirement, sampled_requirements):
    prompt = f"""
**Objective**
Determine whether the **newly generated web app requirement** is *too similar* to any of the three given seed requirements.

---

**Inputs**

* `Seed_A`, `Seed_B`, `Seed_C` (three existing requirements)
* `New_R` (the new requirement to evaluate)

All inputs are short prose specifications.

---

**Similarity Criteria**
1. **Scenario Overlap**
   * Same primary usage scenario (e.g., both are “event ticketing” or “budgeting dashboards”).
2. **Feature Overlap**
   * Shares **≥ 2** identical or near‑identical core features (e.g., “real‑time notifications” + “role‑based access”).
3. **Wording Overlap**
   * **≥ 35 %** of the words or phrases are duplicated or trivially rephrased from any single seed.

If **any** seed meets *one or more* of the above criteria with `New_R`, the requirements are considered **similar**.

---

**Task**
Compare `New_R` against each seed using the criteria. Decide if *at least one* seed is similar.

---

**Output Requirement**
Respond with **one word only**:

* `Yes` – A seed is similar to `New_R`.
* `No`  – No seed is similar under the rules.

---

Seed_A:
{sampled_requirements[0]}

Seed_B:
{sampled_requirements[1]}

Seed_C:
{sampled_requirements[2]}

New_R:
{new_requirement}

Return **only** the final `Yes` or `No`—no explanations.

Your answer:
"""

    messages = [{"role": "user", "content": prompt}]
    
    try:
        response = get_complete_llm_response_for_text(messages, model, client, max_attempts=1, max_tokens=256)
        # Check if response indicates similarity
        return response.lower().strip() == "yes"
    except Exception as e:
        print(f"Error judging similarity: {e}")
        # Default to not similar in case of error to avoid losing potentially good requirements
        return False


def save_requirements_to_file(requirements, file_path="multi-agent-react-gen/requirement-gen/generated_requirements.txt"):
    """Save the current pool of requirements to a file"""
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            for i, req in enumerate(requirements, 1):
                f.write(f"{req}\n")
        print(f"Requirements saved to {file_path}")
    except Exception as e:
        print(f"Error saving requirements to file: {e}")


def save_structured_requirements_to_file(
    entries: List[Dict[str, str]],
    file_path="multi-agent-react-gen/requirement-gen/generated_requirement_grid.jsonl",
):
    """Persist structured Domain/Functionality/Style/Device requirements as JSON lines."""
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            for entry in entries:
                f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        print(f"Structured requirements saved to {file_path}")
    except Exception as e:
        print(f"Error saving structured requirements: {e}")


def generate_requirements_iteratively():
    """Main function to generate requirements iteratively"""
    print("Starting iterative requirement generation...")
    
    # Initialize the pool with seeds
    current_dir = os.path.dirname(os.path.abspath(__file__))
    seeds_path = os.path.join(current_dir, "seeds.txt")
    requirements_pool = read_seeds_from_file(seeds_path)
    
    print(f"Loaded {len(requirements_pool)} initial requirements from seeds")
    
    if len(requirements_pool) < 3:
        print("Error: Need at least 3 seed requirements to start the generation process")
        return
    
    iteration = 0
    
    while len(requirements_pool) < POOL_LIMIT:
        iteration += 1
        print(f"\nIteration {iteration} - Pool size: {len(requirements_pool)}")
        
        # Randomly sample 3 requirements
        sampled = random.sample(requirements_pool, 3)
        print("Sampled requirements:")
        for i, req in enumerate(sampled, 1):
            print(f"  {i}. {req}")
        
        # Generate new requirement
        print("Generating new requirement...")
        new_requirement = generate_new_requirement(sampled)
        
        if not new_requirement:
            print("Failed to generate new requirement, skipping iteration")
            continue
            
        print(f"Generated: {new_requirement}")
        
        # Judge similarity
        print("Judging similarity...")
        is_similar = judge_similarity(new_requirement, sampled)
        print(f"Similarity check: {is_similar}")
        
        if not is_similar:
            requirements_pool.append(new_requirement)
            print("✓ Added to pool")
        else:
            print("✗ Too similar, not added to pool")
    
    print(f"\n🎉 Generation complete! Final pool size: {len(requirements_pool)}")
    
    # Save the final requirements to a file
    save_requirements_to_file(requirements_pool)
    
    return requirements_pool


def generate_requirements_for_combinations(
    output_path="multi-agent-react-gen/requirement-gen/generated_requirement_grid.jsonl",
    start_index: int = 0,
    end_index: Optional[int] = None,
    max_retries: int = 3,
):
    """
    Generate one requirement per Domain*Functionality*Style*Device combination.
    
    Args:
        output_path: Where to write the JSONL results.
        start_index: Zero-based index into the combination list (useful for sharding work).
        end_index: Exclusive zero-based end index. Defaults to all combinations.
        max_retries: How many retries per combination before skipping.
    """
    combinations = get_requirement_combinations()
    total = len(combinations)
    if end_index is None or end_index > total:
        end_index = total
    if start_index < 0 or start_index >= end_index:
        raise ValueError("Invalid start/end indices for combination generation")
    
    selected = combinations[start_index:end_index]
    print(
        f"Generating requirements for combinations {start_index + 1}-{start_index + len(selected)} "
        f"out of {total}"
    )
    
    results = []
    for offset, combo in enumerate(selected, start=start_index + 1):
        print(
            f"[{offset}/{total}] Generating requirement for "
            f"{combo['domain']} | {combo['functionality']} | {combo['style']} | {combo['device']}"
        )
        requirement = None
        attempt = 0
        while attempt < max_retries and not requirement:
            requirement = generate_requirement_for_combination(combo)
            attempt += 1
            if not requirement:
                print(f"  Retry {attempt}/{max_retries} failed.")
        if not requirement:
            print("  Skipping combination due to repeated failures.")
            continue
        results.append(
            {
                "id": offset,
                "domain": combo["domain"],
                "functionality": combo["functionality"],
                "style": combo["style"],
                "device": combo["device"],
                "requirement": requirement,
            }
        )
    
    save_structured_requirements_to_file(results, output_path)
    return results


def main():
    parser = argparse.ArgumentParser(
        description="Requirement generator supporting iterative pool mode and exhaustive combination mode."
    )
    parser.add_argument(
        "--mode",
        choices=["iterative", "grid"],
        default="iterative",
        help="Select generation strategy. 'grid' covers every Domain*Functionality*Style*Device combination.",
    )
    parser.add_argument(
        "--output",
        default="multi-agent-react-gen/requirement-gen/generated_requirement_grid.jsonl",
        help="Output file for structured combination requirements (grid mode only).",
    )
    parser.add_argument(
        "--start-index",
        type=int,
        default=0,
        help="Zero-based start index for combination generation (grid mode).",
    )
    parser.add_argument(
        "--end-index",
        type=int,
        default=None,
        help="Exclusive zero-based end index for combination generation (grid mode).",
    )
    
    args = parser.parse_args()
    
    if args.mode == "grid":
        final_requirements = generate_requirements_for_combinations(
            output_path=args.output,
            start_index=args.start_index,
            end_index=args.end_index,
        )
    else:
        final_requirements = generate_requirements_iteratively()
    
    print(f"\nCompleted {args.mode} generation with {len(final_requirements)} outputs.")


if __name__ == "__main__":
    main()
