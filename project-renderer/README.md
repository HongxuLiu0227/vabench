# Project Renderer

A Node.js tool for rendering React projects as screenshots using Vite and Puppeteer.

## Features

- **Template Vite Config**: Uses a robust template Vite configuration that handles common dependencies and scenarios
- **Automatic Config Management**: Temporarily replaces generated Vite configs with the template during rendering, then restores the original
- **Parallel Processing**: Supports rendering multiple projects in parallel with configurable concurrency
- **Dependency Management**: Automatically installs missing dependencies from the shared package
- **Port Management**: Automatically finds available ports for each project
- **Cache Clearing**: Clears Vite and build caches before rendering

## Template Vite Config

The project-renderer now uses a template Vite configuration (`vite-config-template.ts`) that:

- **Handles Common Dependencies**: Includes optimizeDeps for popular React libraries like Ant Design, Material-UI, React Router, etc.
- **Provides Path Aliases**: Sets up common path aliases for `@/`, `@components/`, `@pages/`, etc.
- **Supports Multiple Preprocessors**: Configures Less and SCSS with common variables
- **Optimizes Build**: Includes manual chunk splitting for better performance
- **Works with Shared Dependencies**: Only includes dependencies that are actually installed in the shared-package

### How Template Config Works

1. **Backup Original**: Before rendering, the original Vite config is backed up to `.original.bak`
2. **Apply Template**: The template config is copied to replace the original
3. **Inject Plugin**: The missing handler plugin is injected into the template config
4. **Render**: The project is rendered using the template config
5. **Restore Original**: After rendering, the original config is restored from backup

This ensures that:
- Generated projects with problematic Vite configs can still be rendered
- The original project configuration is preserved
- The rendering process uses a consistent, reliable configuration

## Usage

### Single Project

```bash
node render-project.js --project 'path/to/project' --output './screenshot.png'
```

### Multiple Projects

```bash
node render-project.js --projects 'path/to/projects/*' --output './screenshots'
```

### With Concurrency

```bash
node render-project.js --projects '**/complex-*' --output './output' --concurrency 4
```

## Examples

```bash
# Render a single project
node render-project.js --project 'selected-project/complex-spa' --output './screenshot.png'

# Render all projects in a directory
node render-project.js --projects 'selected-project/*' --output './screenshots'

# Render projects matching a pattern with 4 concurrent workers
node render-project.js --projects '**/complex-*' --output './output' --concurrency 4
```

## Template Config Features

The template Vite config includes:

### Optimized Dependencies
- React ecosystem: `react`, `react-dom`, `react-router-dom`
- UI libraries: `antd`, `@mui/material`, `@mui/icons-material`
- State management: `zustand`, `@reduxjs/toolkit`, `react-redux`
- Forms: `react-hook-form`, `formik`, `yup`
- Charts: `recharts`, `react-chartjs-2`, `chart.js`
- Icons: `react-icons`, `react-feather`
- Styling: `styled-components`, `@emotion/react`, `@emotion/styled`
- Utilities: `axios`, `lodash`, `date-fns`, `uuid`
- And many more...

### Path Aliases
```typescript
resolve: {
  alias: {
    '@': resolve(__dirname, 'src'),
    '@components': resolve(__dirname, 'src/components'),
    '@pages': resolve(__dirname, 'src/pages'),
    '@hooks': resolve(__dirname, 'src/hooks'),
    '@utils': resolve(__dirname, 'src/utils'),
    '@types': resolve(__dirname, 'src/types'),
    '@assets': resolve(__dirname, 'src/assets'),
    '@styles': resolve(__dirname, 'src/styles'),
    '@services': resolve(__dirname, 'src/services'),
    '@contexts': resolve(__dirname, 'src/contexts'),
    '@layouts': resolve(__dirname, 'src/layouts'),
    '@data': resolve(__dirname, 'src/data'),
  },
}
```

### Build Optimization
- Manual chunk splitting for better caching
- Optimized bundle sizes
- Support for various file types and preprocessors

## Requirements

- Node.js 18+
- Access to the shared-package with all dependencies installed
- Projects must have a `vite.config.ts` or `vite.config.js` file

## Troubleshooting

### Dependency Resolution Warnings
The template config includes many optional dependencies. Warnings about missing dependencies are normal and don't affect rendering - only the dependencies actually used by the project will be resolved.

### Port Conflicts
The renderer automatically finds available ports starting from 3000. Each worker gets a range of 100 ports to avoid conflicts.

### Config Restoration Issues
If the original config isn't restored properly, check for `.original.bak` files in the project directory. You can manually restore by copying the backup file back to the original name.

## Architecture

The project-renderer consists of:

1. **Main Script** (`render-project.js`): Handles argument parsing and orchestration
2. **Template Config** (`vite-config-template.ts`): Robust Vite configuration template
3. **Worker Script** (generated): Handles parallel rendering of individual projects
4. **Missing Handler Plugin** (`vite-plugin-missing-handler.ts`): Handles missing imports during rendering

The system ensures that generated projects with potentially problematic Vite configurations can be reliably rendered while preserving their original configuration. 