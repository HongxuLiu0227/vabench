import type { Plugin } from "vite";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
let babelModules: {
  parser: any;
  traverse: any;
  generate: any;
} | null = null;

// Dynamically import babel modules to handle missing dependencies gracefully
async function loadBabelModules() {
  if (!babelModules) {
    try {
      const babelParser = await import("@babel/parser");
      const traverseModule = await import("@babel/traverse");
      const generateModule = await import("@babel/generator");
      
      // Handle the traverse function properly - newer versions have different export structure
      let traverse: any;
      
      // Try different ways to access traverse function
      if (typeof (traverseModule as any).default === "function") {
        traverse = (traverseModule as any).default;
      } else if (typeof (traverseModule as any).default?.default === "function") {
        traverse = (traverseModule as any).default.default;
      } else if (typeof (traverseModule as any).traverse === "function") {
        traverse = (traverseModule as any).traverse;
      } else if (typeof traverseModule === "function") {
        traverse = traverseModule;
      } else {
        // Try to access the traverse function from the module
        const traverseKeys = Object.keys(traverseModule);
        for (const key of traverseKeys) {
          if (typeof (traverseModule as any)[key] === "function") {
            traverse = (traverseModule as any)[key];
            break;
          }
        }
      }
      
      if (typeof traverse !== "function") {
        throw new Error("Could not find traverse function in @babel/traverse");
      }
      
      babelModules = {
        parser: babelParser,
        traverse: traverse,
        generate: generateModule.default
      };
    } catch (e) {
      console.warn(
        "[vite-plugin-missing-handler] Babel modules not available, skipping AST transformations:",
        e.message
      );
      return false;
    }
  }
  return true;
}

function getExtension(file: string) {
  const match = file.match(/\.(\w+)$/);
  return match ? match[1] : "";
}

// Extracts the npm package name from an import source
function getNpmPackageName(source: string): string {
  if (source.startsWith("@")) {
    const match = source.match(/^(@[^/]+\/[^/]+)/);
    return match ? match[1] : source;
  } else {
    const match = source.match(/^([^/]+)/);
    return match ? match[1] : source;
  }
}

function findFileByBasename(
  rootDir: string,
  basename: string,
  exts: string[]
): string | null {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      const found = findFileByBasename(fullPath, basename, exts);
      if (found) return found;
    } else if (entry.isFile()) {
      for (const ext of exts) {
        if (entry.name === basename + ext) {
          return fullPath;
        }
      }
    }
  }
  return null;
}

const VIRTUAL_PREFIX = "/@vite-plugin-missing-handler/";

export default function missingHandlerPlugin(): Plugin {
  return {
    name: "vite-plugin-missing-handler",
    config(config) {
      // Ensure Vite can resolve modules through symlinks
      if (!config.resolve) config.resolve = {};
      if (!config.resolve.preserveSymlinks) {
        config.resolve.preserveSymlinks = false; // Allow following symlinks
      }

      // Add fallback for node_modules resolution
      if (!config.resolve.alias) config.resolve.alias = [];
      if (Array.isArray(config.resolve.alias)) {
        config.resolve.alias.push({
          find: /^@babel\/(.*)/,
          replacement: path.resolve(
            process.cwd(),
            "../shared-package/node_modules/@babel/$1"
          ),
        });
        config.resolve.alias.push({
          find: "vite",
          replacement: path.resolve(
            process.cwd(),
            "../shared-package/node_modules/vite"
          ),
        });
      }

      // Ensure proper module resolution paths
      if (!config.resolve.dedupe) config.resolve.dedupe = [];
      config.resolve.dedupe.push(
        "vite",
        "@babel/parser",
        "@babel/traverse",
        "@babel/generator"
      );
    },
    async resolveId(source, importer) {
      if (source.startsWith(".") || source.startsWith("/")) {
        const resolved = importer
          ? path.resolve(path.dirname(importer), source)
          : source;
        const exts = ["", ".tsx", ".ts", ".jsx", ".js"];
        for (const ext of exts) {
          const filePath = resolved + ext;
          if (fs.existsSync(filePath)) return null;
        }
        // If the import path does not exist as a file or directory, and has no extension, treat as virtual folder import
        const hasExtension = /\.[a-zA-Z0-9]+$/.test(resolved);
        if (!hasExtension && !fs.existsSync(resolved)) {
          if (/component|page/i.test(source)) {
            return VIRTUAL_PREFIX + source.replace(/\.\.\//g, "./") + ".tsx";
          } else {
            return VIRTUAL_PREFIX + source.replace(/\.\.\//g, "./") + ".js";
          }
        }
        const srcDir = path.join(process.cwd(), "src");
        const basename = path.basename(resolved);
        if (fs.existsSync(srcDir)) {
          const found = findFileByBasename(srcDir, basename, exts);
          if (found) return found;
        }
        return "\0virtual-placeholder:" + source;
      }
      try {
        require.resolve(source, { paths: [process.cwd()] });
        return null;
      } catch {
        const pkgName = getNpmPackageName(source);
        try {
          console.log(
            `[vite-plugin-missing-handler] Installing missing package: ${pkgName}`
          );
          execSync(`npm install ${pkgName} --force`, { stdio: "inherit" });
        } catch (e) {
          console.error(
            `[vite-plugin-missing-handler] Failed to install package: ${pkgName}`
          );
        }
        return null;
      }
    },
    async load(id) {
      // Patch src/ files with exactly one named export and no default export
      if (
        id.includes("/src/") &&
        /\.(js|ts|jsx|tsx)$/.test(id) &&
        fs.existsSync(id)
      ) {
        const babelAvailable = await loadBabelModules();
        if (!babelAvailable) {
          // Fallback: use simple regex-based approach when Babel is not available
          let code = fs.readFileSync(id, "utf8");
          
          // Simple regex to check for exports
          const hasDefaultExport = /export\s+default/.test(code);
          const namedExportMatches = code.match(/export\s+(?:const|function|class|let|var)\s+(\w+)/g);
          const namedExports = namedExportMatches ? 
            namedExportMatches.map(match => match.match(/\w+$/)?.[0]).filter(Boolean) : [];
          
          if (!hasDefaultExport && namedExports.length === 1) {
            code += `\nexport default ${namedExports[0]};\n`;
            return code;
          }
          return null;
        }

        let code = fs.readFileSync(id, "utf8");
        let ast;
        try {
          ast = babelModules!.parser.parse(code, {
            sourceType: "module",
            plugins: [
              "jsx",
              "typescript",
              "classProperties",
              "objectRestSpread",
              "exportDefaultFrom",
              "exportNamespaceFrom",
            ],
          });
        } catch (e) {
          return null; // fallback to Vite if parse fails
        }
        let hasDefault = false;
        let namedExports: string[] = [];
        (babelModules!.traverse as any)(ast, {
          ExportDefaultDeclaration() {
            hasDefault = true;
          },
          ExportNamedDeclaration(path: any) {
            if (path.node.declaration) {
              if (path.node.declaration.id && path.node.declaration.id.name) {
                namedExports.push(path.node.declaration.id.name);
              } else if (path.node.declaration.declarations) {
                for (const decl of path.node.declaration.declarations) {
                  if (decl.id && decl.id.name) namedExports.push(decl.id.name);
                }
              }
            }
            if (path.node.specifiers) {
              for (const spec of path.node.specifiers) {
                if (spec.exported && spec.exported.name)
                  namedExports.push(spec.exported.name);
              }
            }
          },
        });
        // Remove duplicates
        namedExports = Array.from(new Set(namedExports));
        if (!hasDefault && namedExports.length === 1) {
          code += `\nexport default ${namedExports[0]};\n`;
          return code;
        }
        return null;
      }
      // Handle virtual placeholder for directories (including non-existent folder-like imports)
      if (id.startsWith(VIRTUAL_PREFIX)) {
        // Extract extension and strip for placeholder message
        const extMatch = id.match(/\.(tsx|jsx|js)$/);
        const ext = extMatch ? extMatch[1] : "";
        let file = id.replace(VIRTUAL_PREFIX, "");
        if (ext) file = file.replace(new RegExp(`\.${ext}$`), "");
        let fileName = file.split("/").pop();
        if (ext === "tsx" || ext === "jsx") {
          // Return TSX placeholder with default and named exports
          return `import React from 'react';\nexport const ${fileName} = () => <p>Placeholder for ${fileName}</p>;\nexport default ${fileName};\nexport const __esModule = true;\n`;
        } else {
          // Return JS proxy placeholder
          return `\nexport const ${fileName} = new Proxy({}, {\n  get: (target, prop) => () => ([\n    new Proxy({}, {get: () => 1}),\n    new Proxy({}, {get: () => 2}),\n    new Proxy({}, {get: () => 3}),\n  ])\n});\nexport default ${fileName};\nexport const __esModule = true;\n`;
        }
      }
      if (id.startsWith("\0virtual-placeholder:")) {
        const file = id.replace("\0virtual-placeholder:", "");
        const ext = getExtension(file);
        let fileName = file
          .split("/")
          .pop()
          .replace(new RegExp(`\.${ext}$`), "");
        if (ext === "tsx" || ext === "jsx") {
          return `import React from 'react';\nexport const ${fileName} = () => <p>Placeholder for ${fileName}</p>;\nexport default ${fileName};\nexport const __esModule = true;\n`;
        } else if (ext === "js" || ext === "ts") {
          return `\nexport const ${fileName} = new Proxy({}, {\n  get: (target, prop) => () => ([\n    new Proxy({}, {get: () => 1}),\n    new Proxy({}, {get: () => 2}),\n    new Proxy({}, {get: () => 3}),\n  ])\n});\nexport default ${fileName};\nexport const __esModule = true;\n`;
        } else if (ext === "css") {
          return `* {}`;
        } else {
          return `export const ${fileName} = new Proxy({}, { get: () => 'Placeholder for ${file}' });\nexport default ${fileName};\nexport const __esModule = true;\n`;
        }
      }
      return null;
    },
  };
}
