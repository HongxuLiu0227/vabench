import os
import json
import shutil
from typing import Dict, Any, Optional, List
from logging_config import get_logger

logger = get_logger(__name__)

class EnhancedCheckpointManager:
    """
    Enhanced checkpoint manager with debugging capabilities:
    - Resume from any specific step
    - Execute only one step at a time
    - Better state management for debugging
    - Step-by-step execution control
    """
    
    def __init__(self, output_dir: str):
        self.output_dir = output_dir
        self.checkpoint_dir = os.path.join(output_dir, "checkpoints")
        self.current_checkpoint_file = os.path.join(self.checkpoint_dir, "current_checkpoint.json")
        self.steps_completed_file = os.path.join(self.checkpoint_dir, "steps_completed.json")
        self.debug_mode_file = os.path.join(self.checkpoint_dir, "debug_mode.json")
        
        # Define the ordered steps in the generation process
        self.ORDERED_STEPS = [
            "scaffold",
            "requirement_analysis",
            "router_design",
            "component_generation",
            "relationship_refactor",
            "validation_and_fixing",
            "render",
            "completion"
        ]
        
        # Load debug mode settings
        self.debug_mode = self._load_debug_mode()
    
    def _load_debug_mode(self) -> Dict[str, Any]:
        """Load debug mode configuration."""
        if os.path.exists(self.debug_mode_file):
            try:
                with open(self.debug_mode_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                pass
        return {
            "enabled": False,
            "current_step": None,
            "single_step_mode": False,
            "resume_from_step": None
        }
    
    def _save_debug_mode(self) -> None:
        """Save debug mode configuration."""
        os.makedirs(self.checkpoint_dir, exist_ok=True)
        with open(self.debug_mode_file, 'w', encoding='utf-8') as f:
            json.dump(self.debug_mode, f, indent=2)
    
    def enable_debug_mode(self, resume_from_step: Optional[str] = None, single_step: bool = False) -> None:
        """
        Enable debug mode with optional step resumption and single-step execution.
        
        Args:
            resume_from_step: Step to resume from (if None, uses last checkpoint)
            single_step: If True, only execute one step then pause
        """
        self.debug_mode["enabled"] = True
        self.debug_mode["single_step_mode"] = single_step
        
        if resume_from_step:
            if resume_from_step not in self.ORDERED_STEPS:
                raise ValueError(f"Invalid step '{resume_from_step}'. Valid steps: {self.ORDERED_STEPS}")
            self.debug_mode["resume_from_step"] = resume_from_step
            logger.info(f"[Debug] Enabled debug mode, will resume from step: {resume_from_step}")
        else:
            # Use last checkpoint if available
            checkpoint = self.load_checkpoint()
            if checkpoint:
                last_step = checkpoint.get("step_name")
                self.debug_mode["resume_from_step"] = last_step
                logger.info(f"[Debug] Enabled debug mode, will resume from last checkpoint: {last_step}")
            else:
                self.debug_mode["resume_from_step"] = self.ORDERED_STEPS[0]
                logger.info(f"[Debug] Enabled debug mode, starting from first step: {self.ORDERED_STEPS[0]}")
        
        self._save_debug_mode()
    
    def disable_debug_mode(self) -> None:
        """Disable debug mode."""
        self.debug_mode["enabled"] = False
        self.debug_mode["single_step_mode"] = False
        self.debug_mode["current_step"] = None
        self.debug_mode["resume_from_step"] = None
        self._save_debug_mode()
        logger.info("[Debug] Debug mode disabled")
    
    def is_debug_mode(self) -> bool:
        """Check if debug mode is enabled."""
        return self.debug_mode.get("enabled", False)
    
    def is_single_step_mode(self) -> bool:
        """Check if single step mode is enabled."""
        return self.debug_mode.get("single_step_mode", False)
    
    def get_resume_step(self) -> Optional[str]:
        """
        Determine which step to resume from based on debug mode or checkpoint.
        
        Returns:
            Step name to resume from, or None if starting fresh
        """
        if self.debug_mode.get("enabled"):
            resume_step = self.debug_mode.get("resume_from_step")
            if resume_step:
                logger.info(f"[Debug] Resuming from step: {resume_step}")
                return resume_step
        
        # Fall back to normal checkpoint logic
        checkpoint = self.load_checkpoint()
        if checkpoint:
            last_step = checkpoint.get("step_name")
            if last_step in self.ORDERED_STEPS:
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
        In debug mode, this behavior can be overridden.
        
        Args:
            step_name: Name of the step to check
            
        Returns:
            True if step should be skipped, False otherwise
        """
        if self.debug_mode.get("enabled"):
            resume_step = self.debug_mode.get("resume_from_step")
            if resume_step:
                # In debug mode, only skip steps that come before the resume point
                resume_index = self.ORDERED_STEPS.index(resume_step)
                step_index = self.ORDERED_STEPS.index(step_name)
                if step_index < resume_index:
                    logger.info(f"[Debug] Skipping step {step_name} (comes before resume point {resume_step})")
                    return True
        
        # Normal checkpoint logic
        completed_steps = self._get_completed_steps()
        return step_name in completed_steps
    
    def should_execute_step(self, step_name: str) -> bool:
        """
        Check if a step should be executed based on debug mode and current state.
        
        Args:
            step_name: Name of the step to check
            
        Returns:
            True if step should be executed, False otherwise
        """
        if not self.debug_mode.get("enabled"):
            return not self.should_skip_step(step_name)
        
        resume_step = self.debug_mode.get("resume_from_step")
        if not resume_step:
            return True
        
        resume_index = self.ORDERED_STEPS.index(resume_step)
        step_index = self.ORDERED_STEPS.index(step_name)
        
        # Only execute if this is the resume step or comes after it
        return step_index >= resume_index
    
    def mark_step_started(self, step_name: str) -> None:
        """Mark that a step has started execution."""
        if self.debug_mode.get("enabled"):
            self.debug_mode["current_step"] = step_name
            self._save_debug_mode()
            logger.info(f"[Debug] Started executing step: {step_name}")
    
    def mark_step_completed(self, step_name: str) -> None:
        """Mark that a step has completed execution."""
        if self.debug_mode.get("enabled"):
            self.debug_mode["current_step"] = None
            if self.debug_mode.get("single_step_mode"):
                # In single step mode, update resume point to next step
                step_index = self.ORDERED_STEPS.index(step_name)
                if step_index < len(self.ORDERED_STEPS) - 1:
                    next_step = self.ORDERED_STEPS[step_index + 1]
                    self.debug_mode["resume_from_step"] = next_step
                    logger.info(f"[Debug] Step {step_name} completed. Next step will be: {next_step}")
                    logger.info(f"[Debug] Pausing execution (single step mode). Run again to continue.")
                else:
                    logger.info(f"[Debug] All steps completed!")
            self._save_debug_mode()
        
        # Also update normal checkpoint tracking
        self._mark_step_completed(step_name)
    
    def get_next_step(self) -> Optional[str]:
        """
        Get the next step to execute in debug mode.
        
        Returns:
            Next step name or None if all steps completed
        """
        if not self.debug_mode.get("enabled"):
            return None
        
        current_resume = self.debug_mode.get("resume_from_step")
        if not current_resume:
            return self.ORDERED_STEPS[0]
        
        step_index = self.ORDERED_STEPS.index(current_resume)
        if step_index < len(self.ORDERED_STEPS) - 1:
            return self.ORDERED_STEPS[step_index + 1]
        
        return None
    
    def get_debug_status(self) -> Dict[str, Any]:
        """
        Get current debug mode status and next steps.
        
        Returns:
            Dictionary with debug status information
        """
        checkpoint = self.load_checkpoint()
        completed_steps = self._get_completed_steps()
        
        return {
            "debug_mode_enabled": self.debug_mode.get("enabled", False),
            "single_step_mode": self.debug_mode.get("single_step_mode", False),
            "current_step": self.debug_mode.get("current_step"),
            "resume_from_step": self.debug_mode.get("resume_from_step"),
            "next_step": self.get_next_step(),
            "has_checkpoint": checkpoint is not None,
            "last_checkpoint_step": checkpoint.get("step_name") if checkpoint else None,
            "completed_steps": completed_steps,
            "all_steps": self.ORDERED_STEPS,
            "can_continue": self.get_next_step() is not None
        }
        
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
