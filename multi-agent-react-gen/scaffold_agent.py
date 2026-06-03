import subprocess
import os
import shutil
from logging_config import get_logger

logger = get_logger(__name__)


def scaffold_with_vite(output_dir: str):
    """
    Scaffold a new React project using Vite in the given output directory.
    """
    logger.info(f"[Scaffold Agent] Starting Vite scaffolding at: {output_dir}")

    # Check if output_dir exists
    if os.path.exists(output_dir):
        logger.error(f"[Scaffold Agent] ERROR: Output directory '{output_dir}' already exists. Aborting scaffolding.")
        return

    # Try npm create vite@latest first
    try:
        result = subprocess.run([
            "npm", "create", "vite@latest", output_dir,
            "--", "--template", "react-ts"
        ], check=True, capture_output=True, timeout=120, input=b"\n")
        logger.info(f"[Scaffold Agent] Successfully scaffolded Vite React+TS project at: {output_dir}")
        return
    except subprocess.CalledProcessError as e:
        logger.info(f"[Scaffold Agent] npm create vite@latest failed. Trying npx create-vite@latest...")
        if os.path.exists(output_dir):
            shutil.rmtree(output_dir)
        if e.stderr:
            logger.info(f"[Scaffold Agent] npm create error: {e.stderr.decode(errors='ignore')}")
    except Exception as e:
        logger.info(f"[Scaffold Agent] Unexpected error: {e}")
        if os.path.exists(output_dir):
            shutil.rmtree(output_dir)

    # Try npx create-vite@latest
    try:
        result = subprocess.run([
            "npx", "create-vite@latest", output_dir,
            "--template", "react-ts"
        ], check=True, capture_output=True, timeout=120, input=b"\n")
        logger.info(f"[Scaffold Agent] Successfully scaffolded Vite React+TS project at: {output_dir}")
        return
    except subprocess.CalledProcessError as e:
        logger.error(f"[Scaffold Agent] ERROR: Both npm and npx methods failed to scaffold the project.")
        if e.stderr:
            logger.info(f"[Scaffold Agent] npx create-vite error: {e.stderr.decode(errors='ignore')}")
        if os.path.exists(output_dir):
            shutil.rmtree(output_dir)
    except FileNotFoundError:
        logger.error("[Scaffold Agent] ERROR: Neither npm nor npx is available. Please install Node.js and Vite.")
    except Exception as e:
        logger.error(f"[Scaffold Agent] Unexpected error: {e}")
        if os.path.exists(output_dir):
            shutil.rmtree(output_dir) 