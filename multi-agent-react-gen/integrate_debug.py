#!/usr/bin/env python3
"""
Integration script to add debugging capabilities to your existing main.py

This script shows you how to modify your existing main.py to support:
1. Resuming from any specific step
2. Single-step execution
3. Better debugging control

To use this, you need to:
1. Replace the CheckpointManager import with EnhancedCheckpointManager
2. Add debug mode checks around each step
3. Use the new checkpoint manager methods
"""

import os
import sys

def show_integration_guide():
    """Show how to integrate the enhanced checkpoint manager."""
    
    print("="*80)
    print("INTEGRATION GUIDE FOR ENHANCED CHECKPOINT MANAGER")
    print("="*80)
    
    print("\n1. REPLACE THE IMPORT:")
    print("   Change this line in main.py:")
    print("   from checkpoint_manager import CheckpointManager")
    print("   To:")
    print("   from enhanced_checkpoint_manager import EnhancedCheckpointManager")
    
    print("\n2. UPDATE THE INITIALIZATION:")
    print("   Change this line:")
    print("   checkpoint_manager = CheckpointManager(output_dir)")
    print("   To:")
    print("   checkpoint_manager = EnhancedCheckpointManager(output_dir)")
    
    print("\n3. ADD DEBUG MODE CHECKS:")
    print("   Around each step, add these lines:")
    print("   if checkpoint_manager.should_execute_step('step_name'):")
    print("       checkpoint_manager.mark_step_started('step_name')")
    print("       # ... existing step code ...")
    print("       checkpoint_manager.mark_step_completed('step_name')")
    print("       ")
    print("       # Check if we should continue in single step mode")
    print("       if checkpoint_manager.is_single_step_mode():")
    print("           logger.info('[Debug] Single step mode: Step completed. Run again to continue.')")
    print("           return True")
    print("   else:")
    print("       logger.info('[Orchestrator] Skipping step (already completed or not ready)')")
    
    print("\n4. ADD COMMAND LINE ARGUMENTS:")
    print("   Add these to your argument parser:")
    print("   parser.add_argument('--debug', action='store_true', help='Enable debug mode')")
    print("   parser.add_argument('--resume-from', type=str, help='Resume from specific step')")
    print("   parser.add_argument('--single-step', action='store_true', help='Execute only one step then pause')")
    
    print("\n5. ENABLE DEBUG MODE:")
    print("   In your main function, add:")
    print("   if args.debug:")
    print("       try:")
    print("           checkpoint_manager.enable_debug_mode(args.resume_from, args.single_step)")
    print("           logger.info('[Orchestrator] Debug mode enabled')")
    print("       except ValueError as e:")
    print("           logger.error(f'[Orchestrator] ERROR: {e}')")
    print("           return False")
    
    print("\n6. USAGE EXAMPLES:")
    print("   # Enable debug mode and resume from component_generation")
    print("   python main.py --prompt 'your prompt' --debug --resume-from component_generation")
    print("   ")
    print("   # Enable debug mode with single step execution")
    print("   python main.py --prompt 'your prompt' --debug --single-step")
    print("   ")
    print("   # Continue from where you left off")
    print("   python main.py --prompt 'your prompt' --debug")
    
    print("\n7. DEBUG STATUS:")
    print("   Use the debug_runner.py script to check status:")
    print("   python debug_runner.py --output generated-react-app --status")
    
    print("\n" + "="*80)

def show_modified_main_example():
    """Show an example of how the modified main function should look."""
    
    print("\nEXAMPLE MODIFIED MAIN FUNCTION:")
    print("-" * 50)
    
    example = '''
def generate_react_project(prompt=None, prompt_file=None, output_dir='generated-react-app',
                          debug_mode=False, resume_from_step=None, single_step=False):
    """
    Generate a React project with enhanced debugging capabilities.
    """
    # ... existing prompt handling code ...
    
    # Initialize enhanced checkpoint manager
    checkpoint_manager = EnhancedCheckpointManager(output_dir)
    
    # Configure debug mode if requested
    if debug_mode:
        try:
            checkpoint_manager.enable_debug_mode(resume_from_step, single_step)
            logger.info("[Orchestrator] Debug mode enabled")
        except ValueError as e:
            logger.error(f"[Orchestrator] ERROR: {e}")
            return False
    
    # ... existing checkpoint loading code ...
    
    try:
        # 1. Scaffold Agent
        if checkpoint_manager.should_execute_step("scaffold"):
            checkpoint_manager.mark_step_started("scaffold")
            logger.info("[Orchestrator] Running Scaffold Agent...")
            
            # ... existing scaffold code ...
            
            checkpoint_manager.mark_step_completed("scaffold")
            
            # Check if we should continue in single step mode
            if checkpoint_manager.is_single_step_mode():
                logger.info("[Debug] Single step mode: Scaffold completed. Run again to continue.")
                return True
        else:
            logger.info("[Orchestrator] Skipping Scaffold Agent (already completed)")
        
        # 2. Requirement Analysis Agent
        if checkpoint_manager.should_execute_step("requirement_analysis"):
            checkpoint_manager.mark_step_started("requirement_analysis")
            logger.info("[Orchestrator] Running Requirement Analysis Agent...")
            
            # ... existing requirement analysis code ...
            
            checkpoint_manager.mark_step_completed("requirement_analysis")
            
            # Check if we should continue in single step mode
            if checkpoint_manager.is_single_step_mode():
                logger.info("[Debug] Single step mode: Requirement analysis completed. Run again to continue.")
                return True
        else:
            logger.info("[Orchestrator] Skipping Requirement Analysis Agent (already completed)")
        
        # ... continue with other steps using the same pattern ...
        
        # Mark completion and clear checkpoints
        checkpoint_manager.save_checkpoint("completion", {
            "status": "completed",
            "timestamp": checkpoint_manager._get_timestamp()
        })
        
        # Disable debug mode on completion
        if checkpoint_manager.is_debug_mode():
            checkpoint_manager.disable_debug_mode()
            logger.info("[Debug] Debug mode disabled - project generation completed")
        
        checkpoint_manager.clear_checkpoints()
        
        logger.info("[Orchestrator] Project generation complete!")
        return True
        
    except Exception as e:
        logger.error(f"[Orchestrator] ERROR during project generation: {e}")
        return False
'''
    
    print(example)

def main():
    """Main function to show integration guide."""
    
    if len(sys.argv) > 1 and sys.argv[1] == "--example":
        show_modified_main_example()
    else:
        show_integration_guide()
        
        print("\nWould you like to see an example of the modified main function?")
        print("Run: python integrate_debug.py --example")

if __name__ == "__main__":
    main()

