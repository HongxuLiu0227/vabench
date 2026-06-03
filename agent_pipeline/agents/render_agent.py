# render_agent.py

import os
import subprocess
import tempfile
import shutil
import json
from ..logging_config import get_logger

logger = get_logger(__name__)

def render_project(generated_files, screenshot_path=None):
    """
    Render a React project from generated files and capture console output.
    
    Args:
        generated_files (dict): Dictionary mapping file paths to file contents
        screenshot_path (str, optional): Path to save the screenshot. If None, screenshot is deleted after rendering.
    
    Returns:
        dict: Dictionary containing:
            - success (bool): Whether rendering was successful
            - console_output (str): All console messages from the rendering process
            - screenshot_path (str): Path where screenshot was saved (if successful and path provided)
            - error (str): Error message if rendering failed
    """
    logger.info(f"[Render Agent] Starting render process for {len(generated_files)} files")
    
    # Create temporary directory for the project
    temp_dir = tempfile.mkdtemp(prefix="render_project_")
    
    try:
        # Write all generated files to the temporary directory
        logger.info("[Render Agent] Writing generated files to temporary directory")
        for rel_path, content in generated_files.items():
            abs_path = os.path.join(temp_dir, rel_path)
            os.makedirs(os.path.dirname(abs_path), exist_ok=True)
            with open(abs_path, "w", encoding="utf-8") as f:
                f.write(content)
        
        # Determine output path for screenshot
        if screenshot_path:
            # Use provided path
            output_path = screenshot_path
            # Ensure directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            logger.info(f"[Render Agent] Screenshot will be saved to: {output_path}")
        else:
            # Use temporary path that will be deleted
            output_path = os.path.join(temp_dir, "screenshot.png")
            logger.info("[Render Agent] Screenshot will be temporary and deleted after rendering")
        
        # Get the path to the render-project.js script
        script_dir = os.path.dirname(__file__)
        render_script = os.path.join(script_dir, "..", "project-renderer", "render-project.js")
        
        if not os.path.exists(render_script):
            error_msg = f"Render script not found at: {render_script}"
            logger.error(f"[Render Agent] {error_msg}")
            return {
                "success": False,
                "console_output": "",
                "screenshot_path": None,
                "error": error_msg
            }
        
        # Prepare command to run the render script
        cmd = [
            "node",
            render_script,
            "--project", temp_dir,
            "--output", output_path
        ]
        
        logger.info(f"[Render Agent] Running command: {' '.join(cmd)}")
        
        # Run the render script and capture output
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300,  # 5 minute timeout
                cwd=os.path.dirname(render_script)  # Run from script directory
            )
            
            # Combine stdout and stderr for console output
            console_output = ""
            if result.stdout:
                console_output += result.stdout
            if result.stderr:
                console_output += result.stderr
            
            logger.info(f"[Render Agent] Render process completed with return code: {result.returncode}")
            logger.info(f"[Render Agent] Console output length: {len(console_output)} characters")
            
            # Check if rendering was successful
            if result.returncode == 0:
                # Check if screenshot was actually created
                if os.path.exists(output_path):
                    logger.info(f"[Render Agent] Screenshot successfully created at: {output_path}")
                    
                    # If screenshot_path was not provided, we need to copy it to a permanent location
                    # or return the temporary path (which will be cleaned up)
                    final_screenshot_path = output_path if screenshot_path else None
                    
                    return {
                        "success": True,
                        "console_output": console_output,
                        "screenshot_path": final_screenshot_path,
                        "error": None
                    }
                else:
                    error_msg = "Rendering completed but screenshot file was not created"
                    logger.error(f"[Render Agent] {error_msg}")
                    return {
                        "success": False,
                        "console_output": console_output,
                        "screenshot_path": None,
                        "error": error_msg
                    }
            else:
                error_msg = f"Render process failed with return code {result.returncode}"
                logger.error(f"[Render Agent] {error_msg}")
                return {
                    "success": False,
                    "console_output": console_output,
                    "screenshot_path": None,
                    "error": error_msg
                }
                
        except subprocess.TimeoutExpired:
            error_msg = "Render process timed out after 5 minutes"
            logger.error(f"[Render Agent] {error_msg}")
            return {
                "success": False,
                "console_output": "",
                "screenshot_path": None,
                "error": error_msg
            }
        except Exception as e:
            error_msg = f"Unexpected error during rendering: {str(e)}"
            logger.error(f"[Render Agent] {error_msg}")
            return {
                "success": False,
                "console_output": "",
                "screenshot_path": None,
                "error": error_msg
            }
    
    finally:
        # Clean up temporary directory
        try:
            if screenshot_path is None:
                # If no screenshot path was provided, clean up everything including the screenshot
                shutil.rmtree(temp_dir)
                logger.info("[Render Agent] Temporary directory and screenshot cleaned up")
            else:
                # If screenshot path was provided, only clean up the project files, not the screenshot
                # Remove everything except the screenshot
                for item in os.listdir(temp_dir):
                    item_path = os.path.join(temp_dir, item)
                    if os.path.isfile(item_path) and item != "screenshot.png":
                        os.remove(item_path)
                    elif os.path.isdir(item_path):
                        shutil.rmtree(item_path)
                # Remove the temp directory itself
                os.rmdir(temp_dir)
                logger.info("[Render Agent] Temporary project files cleaned up, screenshot preserved")
        except Exception as e:
            logger.warning(f"[Render Agent] Warning: Could not clean up temporary directory: {e}")


def render_project_with_custom_width(generated_files, screenshot_path=None, width=1920):
    """
    Render a React project from generated files with custom viewport width.
    
    Args:
        generated_files (dict): Dictionary mapping file paths to file contents
        screenshot_path (str, optional): Path to save the screenshot. If None, screenshot is deleted after rendering.
        width (int): Viewport width for rendering (default: 1920)
    
    Returns:
        dict: Dictionary containing:
            - success (bool): Whether rendering was successful
            - console_output (str): All console messages from the rendering process
            - screenshot_path (str): Path where screenshot was saved (if successful and path provided)
            - error (str): Error message if rendering failed
    """
    logger.info(f"[Render Agent] Starting render process for {len(generated_files)} files with width {width}")
    
    # Create temporary directory for the project
    temp_dir = tempfile.mkdtemp(prefix="render_project_")
    
    try:
        # Write all generated files to the temporary directory
        logger.info("[Render Agent] Writing generated files to temporary directory")
        for rel_path, content in generated_files.items():
            abs_path = os.path.join(temp_dir, rel_path)
            os.makedirs(os.path.dirname(abs_path), exist_ok=True)
            with open(abs_path, "w", encoding="utf-8") as f:
                f.write(content)
        
        # Determine output path for screenshot
        if screenshot_path:
            # Use provided path
            output_path = screenshot_path
            # Ensure directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            logger.info(f"[Render Agent] Screenshot will be saved to: {output_path}")
        else:
            # Use temporary path that will be deleted
            output_path = os.path.join(temp_dir, "screenshot.png")
            logger.info("[Render Agent] Screenshot will be temporary and deleted after rendering")
        
        # Get the path to the render-project.js script
        script_dir = os.path.dirname(__file__)
        render_script = os.path.join(script_dir, "..", "project-renderer", "render-project.js")
        
        if not os.path.exists(render_script):
            error_msg = f"Render script not found at: {render_script}"
            logger.error(f"[Render Agent] {error_msg}")
            return {
                "success": False,
                "console_output": "",
                "screenshot_path": None,
                "error": error_msg
            }
        
        # Prepare command to run the render script with custom width
        cmd = [
            "node",
            render_script,
            "--project", temp_dir,
            "--output", output_path,
            "--width", str(width)
        ]
        
        logger.info(f"[Render Agent] Running command: {' '.join(cmd)}")
        
        # Run the render script and capture output
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300,  # 5 minute timeout
                cwd=os.path.dirname(render_script)  # Run from script directory
            )
            
            # Combine stdout and stderr for console output
            console_output = ""
            if result.stdout:
                console_output += result.stdout
            if result.stderr:
                console_output += result.stderr
            
            logger.info(f"[Render Agent] Render process completed with return code: {result.returncode}")
            logger.info(f"[Render Agent] Console output length: {len(console_output)} characters")
            
            # Check if rendering was successful
            if result.returncode == 0:
                # Check if screenshot was actually created
                if os.path.exists(output_path):
                    logger.info(f"[Render Agent] Screenshot successfully created at: {output_path}")
                    
                    # If screenshot_path was not provided, we need to copy it to a permanent location
                    # or return the temporary path (which will be cleaned up)
                    final_screenshot_path = output_path if screenshot_path else None
                    
                    return {
                        "success": True,
                        "console_output": console_output,
                        "screenshot_path": final_screenshot_path,
                        "error": None
                    }
                else:
                    error_msg = "Rendering completed but screenshot file was not created"
                    logger.error(f"[Render Agent] {error_msg}")
                    return {
                        "success": False,
                        "console_output": console_output,
                        "screenshot_path": None,
                        "error": error_msg
                    }
            else:
                error_msg = f"Render process failed with return code {result.returncode}"
                logger.error(f"[Render Agent] {error_msg}")
                return {
                    "success": False,
                    "console_output": console_output,
                    "screenshot_path": None,
                    "error": error_msg
                }
                
        except subprocess.TimeoutExpired:
            error_msg = "Render process timed out after 5 minutes"
            logger.error(f"[Render Agent] {error_msg}")
            return {
                "success": False,
                "console_output": "",
                "screenshot_path": None,
                "error": error_msg
            }
        except Exception as e:
            error_msg = f"Unexpected error during rendering: {str(e)}"
            logger.error(f"[Render Agent] {error_msg}")
            return {
                "success": False,
                "console_output": "",
                "screenshot_path": None,
                "error": error_msg
            }
    
    finally:
        # Clean up temporary directory
        try:
            if screenshot_path is None:
                # If no screenshot path was provided, clean up everything including the screenshot
                shutil.rmtree(temp_dir)
                logger.info("[Render Agent] Temporary directory and screenshot cleaned up")
            else:
                # If screenshot path was provided, only clean up the project files, not the screenshot
                # Remove everything except the screenshot
                for item in os.listdir(temp_dir):
                    item_path = os.path.join(temp_dir, item)
                    if os.path.isfile(item_path) and item != "screenshot.png":
                        os.remove(item_path)
                    elif os.path.isdir(item_path):
                        shutil.rmtree(item_path)
                # Remove the temp directory itself
                os.rmdir(temp_dir)
                logger.info("[Render Agent] Temporary project files cleaned up, screenshot preserved")
        except Exception as e:
            logger.warning(f"[Render Agent] Warning: Could not clean up temporary directory: {e}")
