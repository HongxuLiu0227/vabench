# JSONL Component Diff Viewer

A standalone React app to view diffs between `component` and `refactored_code` fields in a JSONL file.

## Features
- Upload a `.jsonl` file
- Browse entries by component name or index
- View side-by-side code diffs using Monaco Editor

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173` (or as shown in your terminal).

3. **Build for production:**
   ```bash
   npm run build
   ```

## Notes
- Handles large files by parsing line-by-line in the browser.
- Only works with JSONL files where each line is a JSON object containing `component` and `refactored_code` fields. 