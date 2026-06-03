#!/bin/bash

# Batch React App Generator
# This script runs the multi-process batch processor for generating React apps

set -e  # Exit on any error

# Default values
REQUIREMENTS_FILE="requirement-gen/generated_requirements.txt"
OUTPUT_DIR="generated-react-app"
PROCESSES=4
START_INDEX=1
MAX_PROMPTS=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --requirements-file)
            REQUIREMENTS_FILE="$2"
            shift 2
            ;;
        --output-dir)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        --processes)
            PROCESSES="$2"
            shift 2
            ;;
        --start-index)
            START_INDEX="$2"
            shift 2
            ;;
        --max-prompts)
            MAX_PROMPTS="$2"
            shift 2
            ;;
        --test)
            MAX_PROMPTS="3"
            echo "Running in test mode with 3 prompts"
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --requirements-file FILE    Path to requirements file (default: requirement-gen/generated_requirements.txt)"
            echo "  --output-dir DIR           Base output directory (default: generated-react-app)"
            echo "  --processes N              Number of parallel processes (default: 4)"
            echo "  --start-index N            Starting index for batch directories (default: 1)"
            echo "  --max-prompts N            Maximum number of prompts to process (for testing)"
            echo "  --test                     Run in test mode (processes 3 prompts)"
            echo "  -h, --help                 Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --test                           # Test with 3 prompts"
            echo "  $0 --processes 8                    # Use 8 parallel processes"
            echo "  $0 --max-prompts 10                 # Process only first 10 prompts"
            echo "  $0 --start-index 5                  # Start from batch-5"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Check if requirements file exists
if [[ ! -f "$REQUIREMENTS_FILE" ]]; then
    echo "Error: Requirements file not found: $REQUIREMENTS_FILE"
    exit 1
fi

# Count total prompts
TOTAL_PROMPTS=$(wc -l < "$REQUIREMENTS_FILE")
echo "Found $TOTAL_PROMPTS prompts in $REQUIREMENTS_FILE"

if [[ -n "$MAX_PROMPTS" ]]; then
    echo "Will process $MAX_PROMPTS prompts (limited for testing)"
else
    echo "Will process all $TOTAL_PROMPTS prompts"
fi

echo "Output directory: $OUTPUT_DIR"
echo "Parallel processes: $PROCESSES"
echo "Starting index: $START_INDEX"
echo ""

# Build the command
CMD="python batch_processor.py"
CMD="$CMD --requirements-file '$REQUIREMENTS_FILE'"
CMD="$CMD --output-dir '$OUTPUT_DIR'"
CMD="$CMD --processes $PROCESSES"
CMD="$CMD --start-index $START_INDEX"

if [[ -n "$MAX_PROMPTS" ]]; then
    CMD="$CMD --max-prompts $MAX_PROMPTS"
fi

echo "Running: $CMD"
echo ""

# Run the batch processor
eval $CMD

echo ""
echo "Batch processing complete!"
echo "Check the log file 'batch_processor.log' for detailed information."
echo "Results summary saved to: $OUTPUT_DIR/batch_summary.json" 