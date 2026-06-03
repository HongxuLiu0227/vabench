import os
import json
import shutil
from typing import Dict, Any, Optional
from logging_config import get_logger

logger = get_logger(__name__)

class CheckpointManager:
    """
    Manages automatic checkpointing and recovery for the generation process.
    Auto-saves state at each major step and can resume from the last successful checkpoint.
    """
    
    def __init__(self, output_dir: str):
        self.output_dir = output_dir
        self.checkpoint_dir = os.path.join(output_dir, "checkpoints")
        self.current_checkpoint_file = os.path.join(self.checkpoint_dir, "current_checkpoint.json")
        self.steps_completed_file = os.path.join(self.checkpoint_dir, "steps_completed.json")
        
        # Don't create checkpoint directory on init - create it only when saving first checkpoint
        # This prevents interference with fresh start detection
        
        # Define the ordered steps in the generation process
        self.ORDERED_STEPS = [
            "scaffold",
            "requirement_analysis", 
            "component_generation",
            "relationship_refactor",
            "validation_and_fixing",
            "render",
            "completion"
        ]
    
    def save_checkpoint(self, step_name: str, state_data: Dict[str, Any]) -> None:
        """
        Save a checkpoint for the current step.
        
        Args:
            step_name: Name of the current step
            state_data: Dictionary containing all necessary state to resume from this point
        """
        try:
            # Create checkpoint directory if it doesn't exist
            os.makedirs(self.checkpoint_dir, exist_ok=True)
            checkpoint_data = {
                "step_name": step_name,
                "timestamp": self._get_timestamp(),
                "state": state_data
            }
            
            # Save the current checkpoint
            with open(self.current_checkpoint_file, 'w', encoding='utf-8') as f:
                json.dump(checkpoint_data, f, indent=2, default=str)
            
            # Also save a step-specific backup
            step_checkpoint_file = os.path.join(self.checkpoint_dir, f"{step_name}_checkpoint.json")
            with open(step_checkpoint_file, 'w', encoding='utf-8') as f:
                json.dump(checkpoint_data, f, indent=2, default=str)
            
            # Update completed steps
            self._mark_step_completed(step_name)
            
            logger.info(f"[Checkpoint] Saved checkpoint for step: {step_name}")
            
        except Exception as e:
            logger.error(f"[Checkpoint] Failed to save checkpoint for {step_name}: {e}")
    
    def load_checkpoint(self) -> Optional[Dict[str, Any]]:
        """
        Load the most recent checkpoint if it exists.
        
        Returns:
            Dictionary with checkpoint data or None if no checkpoint exists
        """
        try:
            if os.path.exists(self.current_checkpoint_file):
                with open(self.current_checkpoint_file, 'r', encoding='utf-8') as f:
                    checkpoint_data = json.load(f)
                
                step_name = checkpoint_data.get("step_name")
                timestamp = checkpoint_data.get("timestamp")
                
                logger.info(f"[Checkpoint] Found checkpoint for step '{step_name}' from {timestamp}")
                return checkpoint_data
            
            return None
            
        except Exception as e:
            logger.error(f"[Checkpoint] Failed to load checkpoint: {e}")
            return None
    
    def get_resume_step(self) -> Optional[str]:
        """
        Determine which step to resume from based on the last checkpoint.
        
        Returns:
            Step name to resume from, or None if starting fresh
        """
        checkpoint = self.load_checkpoint()
        if checkpoint:
            last_step = checkpoint.get("step_name")
            if last_step in self.ORDERED_STEPS:
                # Resume from the next step after the last completed one
                last_step_index = self.ORDERED_STEPS.index(last_step)
                if last_step_index < len(self.ORDERED_STEPS) - 1:
                    next_step = self.ORDERED_STEPS[last_step_index + 1]
                    logger.info(f"[Checkpoint] Resuming from step: {next_step}")
                    return next_step
                else:
                    logger.info(f"[Checkpoint] Process was already completed")
                    return None
        
        logger.info(f"[Checkpoint] Starting fresh - no checkpoint found")
        return None
    
    def should_skip_step(self, step_name: str) -> bool:
        """
        Check if a step should be skipped because it's already completed.
        
        Args:
            step_name: Name of the step to check
            
        Returns:
            True if step should be skipped, False otherwise
        """
        completed_steps = self._get_completed_steps()
        return step_name in completed_steps
    
    def clear_checkpoints(self) -> None:
        """
        Clear all checkpoint files after successful completion.
        """
        try:
            if os.path.exists(self.checkpoint_dir):
                shutil.rmtree(self.checkpoint_dir)
                logger.info("[Checkpoint] Cleared all checkpoints after successful completion")
        except Exception as e:
            logger.error(f"[Checkpoint] Failed to clear checkpoints: {e}")
    
    def _mark_step_completed(self, step_name: str) -> None:
        """Mark a step as completed in the tracking file."""
        completed_steps = self._get_completed_steps()
        if step_name not in completed_steps:
            completed_steps.append(step_name)
            
        with open(self.steps_completed_file, 'w', encoding='utf-8') as f:
            json.dump(completed_steps, f, indent=2)
    
    def _get_completed_steps(self) -> list:
        """Get list of completed steps."""
        if os.path.exists(self.steps_completed_file):
            try:
                with open(self.steps_completed_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                return []
        return []
    
    def _get_timestamp(self) -> str:
        """Get current timestamp string."""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    def get_checkpoint_info(self) -> Dict[str, Any]:
        """
        Get information about the current checkpoint state.
        
        Returns:
            Dictionary with checkpoint information
        """
        checkpoint = self.load_checkpoint()
        completed_steps = self._get_completed_steps()
        
        return {
            "has_checkpoint": checkpoint is not None,
            "last_step": checkpoint.get("step_name") if checkpoint else None,
            "last_timestamp": checkpoint.get("timestamp") if checkpoint else None,
            "completed_steps": completed_steps,
            "can_resume": checkpoint is not None,
            "next_step": self.get_resume_step()
        }