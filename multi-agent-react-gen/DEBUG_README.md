# Debug Mode for Multi-Agent React Generator

This document explains how to use the enhanced debugging capabilities that allow you to:
- Resume from any specific step
- Execute only one step at a time
- Debug LLM outputs step by step
- Better control over the generation process

## Quick Start

### 1. Check Current Status
```bash
python debug_runner.py --output generated-react-app/spa1 --status
```

### 2. Enable Debug Mode
```bash
# Enable debug mode and resume from last checkpoint
python debug_runner.py --output generated-react-app/spa1 --enable-debug

# Enable debug mode and resume from specific step
python debug_runner.py --output generated-react-app/spa1 --enable-debug --resume-from component_generation

# Enable debug mode with single step execution
python debug_runner.py --output generated-react-app/spa1 --enable-debug --single-step
```

### 3. Run the Pipeline with Debug Mode
```bash
# Resume from where you left off
python main.py --prompt "your prompt" --debug

# Resume from specific step
python main.py --prompt "your prompt" --debug --resume-from component_generation

# Execute one step at a time
python main.py --prompt "your prompt" --debug --single-step
```

## Available Steps

The pipeline has these steps in order:
1. `scaffold` - Create project structure with Vite
2. `requirement_analysis` - Analyze and enrich the prompt
3. `component_generation` - Generate React components
4. `relationship_refactor` - Refactor component relationships
5. `validation_and_fixing` - Validate and fix code issues
6. `render` - Render the final project
7. `completion` - Mark completion

Note: File structure and structure planning are part of the normal flow between requirement_analysis and component_generation, not separate checkpoint steps.

## Debug Mode Features

### Resume from Any Step
You can resume from any specific step, even if it wasn't the last completed one:
```bash
python main.py --prompt "your prompt" --debug --resume-from validation_and_fixing
```

### Single Step Execution
Execute only one step then pause for inspection:
```bash
python main.py --prompt "your prompt" --debug --single-step
```

After the step completes, run the same command again to continue to the next step.

### Automatic State Management
The debug system automatically:
- Tracks which steps have been completed
- Manages state between steps
- Saves checkpoints after each step
- Loads previous state when resuming

## Debug Workflow Example

### Scenario: Debug Component Generation Issues

1. **Check current status:**
   ```bash
   python debug_runner.py --output generated-react-app/spa1 --status
   ```

2. **Enable debug mode and resume from component generation:**
   ```bash
   python debug_runner.py --output generated-react-app/spa1 --enable-debug --resume-from component_generation
   ```

3. **Run the pipeline in debug mode:**
   ```bash
   python main.py --prompt "your prompt" --debug
   ```

4. **Inspect the output:**
   - Check the generated files
   - Review the step logs in `steps_log/`
   - Examine any error messages

5. **If you need to fix something:**
   - Make your changes
   - Run the same command again to continue

6. **For step-by-step debugging:**
   ```bash
   python main.py --prompt "your prompt" --debug --single-step
   ```

## Integration with Existing Code

To add these debugging capabilities to your existing `main.py`:

### 1. Replace the Import
```python
# Change this:
from checkpoint_manager import CheckpointManager

# To this:
from enhanced_checkpoint_manager import EnhancedCheckpointManager
```

### 2. Update Initialization
```python
# Change this:
checkpoint_manager = CheckpointManager(output_dir)

# To this:
checkpoint_manager = EnhancedCheckpointManager(output_dir)
```

### 3. Add Debug Mode Configuration
```python
def generate_react_project(prompt=None, prompt_file=None, output_dir='generated-react-app',
                          debug_mode=False, resume_from_step=None, single_step=False):
    # ... existing code ...
    
    # Configure debug mode if requested
    if debug_mode:
        try:
            checkpoint_manager.enable_debug_mode(resume_from_step, single_step)
            logger.info("[Orchestrator] Debug mode enabled")
        except ValueError as e:
            logger.error(f"[Orchestrator] ERROR: {e}")
            return False
```

### 4. Add Step Execution Checks
```python
# Around each step, add:
if checkpoint_manager.should_execute_step("step_name"):
    checkpoint_manager.mark_step_started("step_name")
    
    # ... existing step code ...
    
    checkpoint_manager.mark_step_completed("step_name")
    
    # Check if we should continue in single step mode
    if checkpoint_manager.is_single_step_mode():
        logger.info("[Debug] Single step mode: Step completed. Run again to continue.")
        return True
else:
    logger.info("[Orchestrator] Skipping step (already completed or not ready)")
```

### 5. Add Command Line Arguments
```python
def main():
    parser = argparse.ArgumentParser(description="Multi-agent React project generator.")
    # ... existing arguments ...
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    parser.add_argument('--resume-from', type=str, help='Resume from specific step')
    parser.add_argument('--single-step', action='store_true', help='Execute only one step then pause')
    
    args = parser.parse_args()
    
    # Call the main generation function
    success = generate_react_project(
        prompt=args.prompt,
        prompt_file=args.prompt_file,
        output_dir=args.output,
        debug_mode=args.debug,
        resume_from_step=args.resume_from,
        single_step=args.single_step
    )
```

## Troubleshooting

### Common Issues

1. **"Invalid step" error:**
   - Check the available steps: `python debug_runner.py --status`
   - Use the exact step names from the list

2. **"Debug mode not enabled" error:**
   - Enable debug mode first: `python debug_runner.py --enable-debug`

3. **Step not executing:**
   - Check if the step comes before your resume point
   - Use `--status` to see the current state

4. **Checkpoint corruption:**
   - Clear checkpoints: `python debug_runner.py --disable-debug`
   - Start fresh or resume from an earlier step

### Debug Tips

1. **Use single step mode** when you want to inspect each step's output
2. **Check step logs** in the `steps_log/` directory for detailed information
3. **Monitor the console output** for real-time debugging information
4. **Use the status command** frequently to understand the current state

## Advanced Usage

### Custom Step Execution
You can create custom step sequences by modifying the `ORDERED_STEPS` list in the checkpoint manager.

### State Inspection
The checkpoint manager saves detailed state information that you can inspect:
```bash
# Check what's in the current checkpoint
ls -la generated-react-app/spa1/checkpoints/
cat generated-react-app/spa1/checkpoints/current_checkpoint.json
```

### Integration with IDEs
The debug system works well with IDEs that support Python debugging. You can set breakpoints in the step execution code to inspect variables and state.

## File Structure

```
multi-agent-react-gen/
├── enhanced_checkpoint_manager.py  # Enhanced checkpoint manager
├── debug_runner.py                 # Debug control script
├── integrate_debug.py              # Integration guide
├── DEBUG_README.md                 # This file
└── main.py                         # Your existing main pipeline
```

## Support

If you encounter issues with the debug system:
1. Check the console output for error messages
2. Use `--status` to verify the current state
3. Review the checkpoint files for corruption
4. Consider starting fresh if the state is inconsistent

