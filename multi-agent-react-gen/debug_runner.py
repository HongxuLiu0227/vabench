#!/usr/bin/env python3
"""
Debug Runner for Multi-Agent React Generator

This script allows you to:
1. Resume from any specific step
2. Execute only one step at a time
3. Check current status
4. Continue execution step by step
"""

import argparse
import json
import os
import sys
from enhanced_checkpoint_manager import EnhancedCheckpointManager
from logging_config import get_logger

logger = get_logger(__name__)

def show_status(checkpoint_manager, output_dir):
    """Show current debug status."""
    status = checkpoint_manager.get_debug_status()
    
    print("\n" + "="*60)
    print("DEBUG STATUS")
    print("="*60)
    print(f"Output directory: {output_dir}")
    print(f"Debug mode enabled: {status['debug_mode_enabled']}")
    print(f"Single step mode: {status['single_step_mode']}")
    print(f"Current step: {status['current_step'] or 'None'}")
    print(f"Resume from step: {status['resume_from_step'] or 'None'}")
    print(f"Next step: {status['next_step'] or 'None'}")
    print(f"Has checkpoint: {status['has_checkpoint']}")
    print(f"Last checkpoint step: {status['last_checkpoint_step'] or 'None'}")
    print(f"Completed steps: {status['completed_steps']}")
    print(f"All steps: {status['all_steps']}")
    print(f"Can continue: {status['can_continue']}")
    print("="*60)

def enable_debug_mode(checkpoint_manager, resume_from_step=None, single_step=False):
    """Enable debug mode with specified settings."""
    try:
        checkpoint_manager.enable_debug_mode(resume_from_step, single_step)
        print(f"[Debug] Debug mode enabled")
        if resume_from_step:
            print(f"[Debug] Will resume from step: {resume_from_step}")
        if single_step:
            print(f"[Debug] Single step mode enabled")
        return True
    except ValueError as e:
        print(f"[Error] {e}")
        return False

def run_single_step(checkpoint_manager, step_name):
    """Run a single step by calling the main pipeline."""
    print(f"[Debug] Running single step: {step_name}")
    
    # Import the main pipeline function
    try:
        from main import generate_react_project
        print(f"[Debug] Imported main pipeline")
    except ImportError as e:
        print(f"[Error] Could not import main pipeline: {e}")
        return False
    
    # Set up debug mode to only run this step
    checkpoint_manager.enable_debug_mode(step_name, single_step=True)
    
    # Run the pipeline (it will stop after one step due to single step mode)
    print(f"[Debug] Starting pipeline execution...")
    # Note: You'll need to call the actual pipeline function here
    # For now, this is a placeholder
    
    return True

def main():
    parser = argparse.ArgumentParser(description="Debug runner for React project generator")
    parser.add_argument('--output', type=str, default='generated-react-app', 
                       help='Output directory for the generated project')
    parser.add_argument('--status', action='store_true', 
                       help='Show current debug status')
    parser.add_argument('--enable-debug', action='store_true',
                       help='Enable debug mode')
    parser.add_argument('--resume-from', type=str,
                       help='Resume from specific step')
    parser.add_argument('--single-step', action='store_true',
                       help='Enable single step mode')
    parser.add_argument('--run-step', type=str,
                       help='Run a specific step (requires --enable-debug)')
    parser.add_argument('--disable-debug', action='store_true',
                       help='Disable debug mode')
    
    args = parser.parse_args()
    
    # Initialize checkpoint manager
    checkpoint_manager = EnhancedCheckpointManager(args.output)
    
    # Show status if requested
    if args.status:
        show_status(checkpoint_manager, args.output)
        return
    
    # Disable debug mode if requested
    if args.disable_debug:
        checkpoint_manager.disable_debug_mode()
        print("[Debug] Debug mode disabled")
        return
    
    # Enable debug mode if requested
    if args.enable_debug:
        if not enable_debug_mode(checkpoint_manager, args.resume_from, args.single_step):
            sys.exit(1)
        show_status(checkpoint_manager, args.output)
        return
    
    # Run specific step if requested
    if args.run_step:
        if not checkpoint_manager.is_debug_mode():
            print("[Error] --run-step requires debug mode to be enabled first")
            print("Use --enable-debug first, then --run-step")
            sys.exit(1)
        
        if args.run_step not in checkpoint_manager.ORDERED_STEPS:
            print(f"[Error] Invalid step '{args.run_step}'")
            print(f"Valid steps: {checkpoint_manager.ORDERED_STEPS}")
            sys.exit(1)
        
        if run_single_step(checkpoint_manager, args.run_step):
            print(f"[Debug] Step {args.run_step} execution initiated")
        else:
            print(f"[Error] Failed to run step {args.run_step}")
            sys.exit(1)
        return
    
    # Default: show status
    show_status(checkpoint_manager, args.output)
    print("\nUse --help to see available options")

if __name__ == "__main__":
    main()

