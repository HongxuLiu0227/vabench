"""
Centralized logging configuration for the multi-agent React generation system.
This module provides consistent logging setup across all agents.
"""

import logging
import os
from datetime import datetime

def setup_logger(name, log_level=logging.INFO):
    """
    Set up a logger with consistent formatting and handlers.
    
    Args:
        name (str): The name of the logger (usually __name__)
        log_level: The logging level (default: INFO)
    
    Returns:
        logging.Logger: Configured logger instance
    """
    logger = logging.getLogger(name)
    
    # Avoid adding handlers multiple times
    if logger.handlers:
        return logger
    
    logger.setLevel(log_level)
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # File handler (optional - only if we're in a project context)
    try:
        # Check if we're in a project directory with steps_log
        current_dir = os.getcwd()
        if 'generated-react-app' in current_dir or 'steps_log' in os.listdir(current_dir):
            # We're in a project directory, add file logging
            log_dir = os.path.join(current_dir, 'steps_log')
            os.makedirs(log_dir, exist_ok=True)
            
            # Create a timestamped log file
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            log_file = os.path.join(log_dir, f'agent_log_{timestamp}.log')
            
            file_handler = logging.FileHandler(log_file, encoding='utf-8')
            file_handler.setLevel(log_level)
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)
        # Check if env variable LOG_FILE is set
        if os.getenv('LOG_FILE'):
            log_file = os.getenv('LOG_FILE')
            file_handler = logging.FileHandler(log_file, encoding='utf-8')
            file_handler.setLevel(log_level)
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)
    except Exception:
        # If we can't set up file logging, just continue with console logging
        pass
    
    return logger

def get_logger(name):
    """
    Get a logger instance with the given name.
    
    Args:
        name (str): The name of the logger (usually __name__)
    
    Returns:
        logging.Logger: Logger instance
    """
    return setup_logger(name) 