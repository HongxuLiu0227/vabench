#!/usr/bin/env python3
"""
Web App Requirement Generator - Entry Point

This script runs the iterative requirement generation system that:
1. Starts with seed requirements from seeds.txt
2. Iteratively generates new unique web app requirements
3. Uses LLM to judge similarity and ensure diversity
4. Stops when pool reaches 100 requirements
5. Saves results to generated_requirements.txt
"""

from generator import generate_requirements_iteratively

def main():
    """Main entry point for the requirement generation system"""
    print("=" * 60)
    print("🚀 Web App Requirement Generator")
    print("=" * 60)
    print()
    
    try:
        requirements = generate_requirements_iteratively()
        print(f"\n✅ Successfully generated {len(requirements)} unique web app requirements!")
        print("📁 Results saved to generated_requirements.txt")
        
    except KeyboardInterrupt:
        print("\n❌ Generation interrupted by user")
    except Exception as e:
        print(f"\n❌ Error during generation: {e}")
        raise

if __name__ == "__main__":
    main()
