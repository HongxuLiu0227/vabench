#!/usr/bin/env python3
"""
Multi-process batch processor for React app generation.
Reads prompts from generated_requirements.txt and generates React apps in parallel.
"""

import os
import sys
import time
import json
import logging
from multiprocessing import Pool, Manager, Lock
from pathlib import Path
import subprocess
import argparse
from datetime import datetime

# Add the current directory to Python path to import the main module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the main generation function
from main import generate_react_project

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(processName)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('batch_processor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def read_prompts_from_file(file_path):
    """Read prompts from the requirements file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            prompts = [line.strip() for line in f if line.strip()]
        logger.info(f"Read {len(prompts)} prompts from {file_path}")
        return prompts
    except FileNotFoundError:
        logger.error(f"Requirements file not found: {file_path}")
        return []
    except Exception as e:
        logger.error(f"Error reading requirements file: {e}")
        return []

def generate_single_app(args):
    """Generate a single React app for a given prompt and index."""
    prompt, index, base_output_dir, lock = args
    
    # Create output directory name
    output_dir = os.path.join(base_output_dir, f"batch-{index}")
    
    # Create a temporary prompt file for this specific prompt
    temp_prompt_file = f"temp_prompt_{index}.txt"
    try:
        with open(temp_prompt_file, 'w', encoding='utf-8') as f:
            f.write(prompt)
        
        logger.info(f"Starting generation for batch-{index}")
        start_time = time.time()
        
        # Run the generation
        try:
            success = generate_react_project(prompt_file=temp_prompt_file, output_dir=output_dir)
            end_time = time.time()
            duration = end_time - start_time
            
            if success:
                with lock:
                    logger.info(f"✅ Successfully generated batch-{index} in {duration:.2f}s")
                
                return {
                    'index': index,
                    'status': 'success',
                    'output_dir': output_dir,
                    'duration': duration,
                    'prompt': prompt[:100] + '...' if len(prompt) > 100 else prompt
                }
            else:
                with lock:
                    logger.error(f"❌ Failed to generate batch-{index} after {duration:.2f}s: Generation returned False")
                
                return {
                    'index': index,
                    'status': 'failed',
                    'output_dir': output_dir,
                    'duration': duration,
                    'error': 'Generation returned False',
                    'prompt': prompt[:100] + '...' if len(prompt) > 100 else prompt
                }
            
        except Exception as e:
            end_time = time.time()
            duration = end_time - start_time
            
            with lock:
                logger.error(f"❌ Failed to generate batch-{index} after {duration:.2f}s: {e}")
            
            return {
                'index': index,
                'status': 'failed',
                'output_dir': output_dir,
                'duration': duration,
                'error': str(e),
                'prompt': prompt[:100] + '...' if len(prompt) > 100 else prompt
            }
            
    finally:
        # Clean up temporary prompt file
        if os.path.exists(temp_prompt_file):
            os.remove(temp_prompt_file)

def main():
    parser = argparse.ArgumentParser(description="Batch processor for React app generation")
    parser.add_argument(
        '--requirements-file', 
        type=str, 
        default='requirement-gen/generated_requirements.txt',
        help='Path to the requirements file containing prompts'
    )
    parser.add_argument(
        '--output-dir', 
        type=str, 
        default='generated-react-app',
        help='Base output directory for generated apps'
    )
    parser.add_argument(
        '--processes', 
        type=int, 
        default=4,
        help='Number of parallel processes to use'
    )
    parser.add_argument(
        '--start-index', 
        type=int, 
        default=1,
        help='Starting index for batch directories'
    )
    parser.add_argument(
        '--max-prompts', 
        type=int, 
        default=None,
        help='Maximum number of prompts to process (for testing)'
    )
    
    args = parser.parse_args()
    
    # Read prompts
    prompts = read_prompts_from_file(args.requirements_file)
    if not prompts:
        logger.error("No prompts found. Exiting.")
        return
    
    # Limit prompts if specified
    if args.max_prompts:
        prompts = prompts[:args.max_prompts]
        logger.info(f"Limited to {len(prompts)} prompts for testing")
    
    # Create base output directory
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Create a manager for shared state
    manager = Manager()
    lock = manager.Lock()
    
    # Prepare arguments for each process
    process_args = []
    for i, prompt in enumerate(prompts, start=args.start_index):
        process_args.append((prompt, i, args.output_dir, lock))
    
    # Create batch processing summary
    batch_summary = {
        'start_time': datetime.now().isoformat(),
        'total_prompts': len(prompts),
        'processes': args.processes,
        'base_output_dir': args.output_dir,
        'start_index': args.start_index,
        'results': []
    }
    
    logger.info(f"Starting batch processing with {args.processes} processes")
    logger.info(f"Will generate {len(prompts)} React apps")
    logger.info(f"Output directory: {args.output_dir}")
    
    # Process prompts in parallel
    start_time = time.time()
    
    try:
        with Pool(processes=args.processes) as pool:
            results = pool.map(generate_single_app, process_args)
        
        end_time = time.time()
        total_duration = end_time - start_time
        
        # Collect results
        successful = 0
        failed = 0
        
        for result in results:
            batch_summary['results'].append(result)
            if result['status'] == 'success':
                successful += 1
            else:
                failed += 1
        
        # Log summary
        logger.info("=" * 60)
        logger.info("BATCH PROCESSING COMPLETE")
        logger.info("=" * 60)
        logger.info(f"Total time: {total_duration:.2f}s")
        logger.info(f"Successful: {successful}")
        logger.info(f"Failed: {failed}")
        logger.info(f"Success rate: {successful/(successful+failed)*100:.1f}%")
        
        # Save batch summary
        batch_summary['end_time'] = datetime.now().isoformat()
        batch_summary['total_duration'] = total_duration
        batch_summary['successful'] = successful
        batch_summary['failed'] = failed
        
        summary_file = os.path.join(args.output_dir, 'batch_summary.json')
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(batch_summary, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Batch summary saved to: {summary_file}")
        
        # Print detailed results
        logger.info("\nDetailed Results:")
        for result in results:
            status_icon = "✅" if result['status'] == 'success' else "❌"
            logger.info(f"{status_icon} batch-{result['index']}: {result['status']} ({result['duration']:.2f}s)")
            if result['status'] == 'failed':
                logger.info(f"   Error: {result['error']}")
        
    except KeyboardInterrupt:
        logger.info("Batch processing interrupted by user")
    except Exception as e:
        logger.error(f"Unexpected error during batch processing: {e}")

if __name__ == "__main__":
    main() 