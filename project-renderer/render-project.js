#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { exec, spawn, fork } = require("child_process");
const puppeteer = require("puppeteer");
const net = require("net");
const glob = require("glob");
const { promisify } = require("util");
const os = require("os");

const execAsync = promisify(exec);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function resolveNodeExecutable() {
  return process.execPath || "node";
}

function buildLoginScreenshotPath(outputPath) {
  if (!outputPath.toLowerCase().endsWith(".png")) {
    return `${outputPath}.login.png`;
  }
  return outputPath.replace(/\.png$/i, "-login.png");
}

const DEFAULT_AUTH_CREDENTIALS = Object.freeze({
  username: "admin",
  password: "admin",
});

async function autoLogin(page, credentials) {
  if (!credentials) {
    return { attempted: false, submitted: false };
  }

  try {
    const attempt = await page.evaluate(({ username, password }) => {
      const documentRef = document;

      const findElement = (selectors) => {
        for (const selector of selectors) {
          const node = documentRef.querySelector(selector);
          if (node && !node.disabled && node.offsetParent !== null) {
            return node;
          }
        }
        return null;
      };

      const passwordSelectors = [
        "input[type='password']",
        "input[name='password']",
        "input[name*='password' i]",
        "input[placeholder*='password' i]",
      ];

      const usernameSelectors = [
        "input[name='username']",
        "input[name*='user' i]",
        "input[name*='email' i]",
        "input[type='email']",
        "input[placeholder*='user' i]",
        "input[placeholder*='email' i]",
        "input[type='text']",
      ];

      const setValue = (input, value) => {
        if (!input) return;
        const setNativeValue = (element, val) => {
          const { set: valueSetter } = Object.getOwnPropertyDescriptor(element, "value") || {};
          const prototype = Object.getPrototypeOf(element);
          const { set: protoValueSetter } = Object.getOwnPropertyDescriptor(prototype || {}, "value") || {};
          if (protoValueSetter) {
            protoValueSetter.call(element, val);
          } else if (valueSetter) {
            valueSetter.call(element, val);
          } else {
            element.value = val;
          }
        };

        input.focus();
        setNativeValue(input, value);
        try {
          input.setAttribute("value", value);
        } catch (e) {}
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        input.dispatchEvent(new Event("blur", { bubbles: true }));
      };

      const passwordInput = findElement(passwordSelectors);
      if (!passwordInput) {
        return { attempted: false, submitted: false, reason: "no_password_input" };
      }

      let usernameInput = findElement(usernameSelectors);
      if (!usernameInput) {
        const candidateInputs = Array.from(documentRef.querySelectorAll("input"))
          .filter((input) => input !== passwordInput)
          .filter((input) => input.type !== "hidden")
          .filter((input) => !/password/i.test(input.name || "") && !/password/i.test(input.placeholder || ""))
          .filter((input) => !input.disabled && input.offsetParent !== null);
        usernameInput = candidateInputs[0] || null;
      }

      if (usernameInput) {
        setValue(usernameInput, username);
      }
      setValue(passwordInput, password);

      const form = passwordInput.form || (usernameInput && usernameInput.form);
      if (form) {
        if (form.requestSubmit) {
          form.requestSubmit();
        } else {
          form.submit();
        }
        return {
          attempted: true,
          submitted: true,
          method: "form",
        };
      }

      const buttonCandidates = [
        "button[type='submit']",
        "input[type='submit']",
        "button[data-testid*='login']",
        "button[data-test*='login']",
      ];
      let submitButton = findElement(buttonCandidates);

      if (!submitButton) {
        submitButton = Array.from(documentRef.querySelectorAll("button, input[type='button'], input[type='submit']"))
          .find((btn) => {
            const text = (btn.textContent || btn.value || "").toLowerCase();
            return text.includes("login") || text.includes("sign in") || text.includes("signin") || text.includes("submit");
          }) || null;
      }

      if (submitButton) {
        submitButton.click();
        return {
          attempted: true,
          submitted: true,
          method: "button",
        };
      }

      return {
        attempted: true,
        submitted: false,
        reason: "no_submit_button",
      };
    }, credentials);

    if (attempt.attempted) {
      console.log("  🔐 Auto-login attempted using provided credentials.");
    }

    if (attempt.submitted) {
      try {
        await Promise.race([
          page.waitForNavigation({ waitUntil: "networkidle0", timeout: 10000 }),
          new Promise((resolve) => setTimeout(resolve, 1500)),
        ]);
      } catch (navigationError) {}
      await delay(500);
    }

    return attempt;
  } catch (error) {
    console.log(`  ⚠️ Auto-login attempt failed: ${error.message}`);
    return { attempted: false, submitted: false, error: error.message };
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const argObj = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].replace("--", "");
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        argObj[key] = next;
        i++;
      } else {
        argObj[key] = true;
      }
    }
  }
  return argObj;
}

function isPngFilePath(targetPath) {
  return typeof targetPath === "string" && path.extname(targetPath).toLowerCase() === ".png";
}

function sanitizeRouteToFilename(route, usedNames) {
  const baseName = (() => {
    if (!route || route === "/") {
      return "home";
    }
    const trimmed = route.replace(/^\//, "") || "home";
    const safe = trimmed
      .replace(/[:*?&#]/g, "")
      .replace(/[\\/]+/g, "-")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    return safe || "route";
  })();

  let candidate = baseName;
  let counter = 1;
  while (usedNames.has(candidate)) {
    counter += 1;
    candidate = `${baseName}-${counter}`;
  }
  usedNames.add(candidate);
  return candidate;
}

function discoverRoutePaths(projectPath) {
  const routes = new Set(["/"]);
  const srcDir = path.join(projectPath, "src");
  if (!fs.existsSync(srcDir)) {
    return Array.from(routes);
  }

  const stack = [srcDir];
  const routePatterns = [
    /<Route[^>]*\bpath\s*=\s*["'`]([^"'`]+)["'`]/g,
    /\bpath\s*:\s*["'`]([^"'`]+)["'`]/g,
  ];

  while (stack.length > 0) {
    const currentDir = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch (error) {
      console.warn(`  ⚠️  Could not read directory while discovering routes: ${currentDir}`);
      continue;
    }

    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        stack.push(entryPath);
      } else if (entry.isFile() && /\.(t|j)sx?$/.test(entry.name)) {
        let content = "";
        try {
          content = fs.readFileSync(entryPath, "utf8");
        } catch (error) {
          console.warn(`  ⚠️  Could not read file while discovering routes: ${entryPath}`);
          continue;
        }

        for (const pattern of routePatterns) {
          pattern.lastIndex = 0;
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const route = (match[1] || "").trim();
            if (!route || route === "*" || route.includes("*")) {
              continue;
            }
            if (route.startsWith("http")) {
              continue;
            }
            if (route.includes("{") || route.includes("}")) {
              continue;
            }
            if (route.includes(":")) {
              continue;
            }
            const normalized = route.startsWith("/") ? route : `/${route}`;
            routes.add(normalized);
          }
        }
      }
    }
  }

  return Array.from(routes).sort((a, b) => {
    if (a === "/") return -1;
    if (b === "/") return 1;
    return a.localeCompare(b);
  });
}

function resolveRouteList(option, projectPath) {
  if (!option || option === "auto") {
    return discoverRoutePaths(projectPath);
  }

  const routes = new Set();
  option
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .forEach((route) => {
      const normalized = route.startsWith("/") ? route : `/${route}`;
      routes.add(normalized);
    });

  if (!routes.has("/")) {
    routes.add("/");
  }

  return Array.from(routes).sort((a, b) => {
    if (a === "/") return -1;
    if (b === "/") return 1;
    return a.localeCompare(b);
  });
}

async function findAvailablePort(startPort = 3000) {
  const server = net.createServer();
  server.unref();
  return new Promise((resolve) => {
    server.on("error", () => {
      server.close();
      resolve(findAvailablePort(startPort + 1));
    });
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}

async function waitForServer(port, timeout = 60000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const check = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:${port}`);
        if (res.ok) {
          clearInterval(check);
          resolve();
        }
      } catch (error) {
        // Log error for debugging
        if (Date.now() - startTime > timeout - 5000) {
          console.log(`  ⏳ Still waiting for server on port ${port}...`);
        }
      }
      if (Date.now() - startTime > timeout) {
        clearInterval(check);
        reject(
          new Error(`Server did not respond on port ${port} within ${timeout/1000}s timeout`)
        );
      }
    }, 1000); // Check every second instead of 500ms
  });
}

async function waitForViteReady(devProcess, port, timeout = 60000) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let output = "";

    const finish = (error = null) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      devProcess.stdout.off("data", onStdout);
      devProcess.stderr.off("data", onStderr);
      devProcess.off("error", onError);
      devProcess.off("exit", onExit);
      if (error) {
        reject(error);
      } else {
        resolve(output);
      }
    };

    const handleChunk = (data, writer) => {
      const str = data.toString();
      output += str;
      writer(str);

      if (str.includes("Local:") && (str.includes(`localhost:${port}`) || str.includes(`127.0.0.1:${port}`))) {
        finish();
        return;
      }

      if (/error when starting dev server/i.test(str) || str.includes(`Port ${port} is already in use`)) {
        finish(new Error(`Vite failed before ready on port ${port}: ${str.trim()}`));
      }
    };

    const onStdout = (data) => handleChunk(data, (str) => process.stdout.write(str));
    const onStderr = (data) => handleChunk(data, (str) => process.stderr.write(str));
    const onError = (error) => finish(new Error(`Failed to start Vite server: ${error.message}`));
    const onExit = (code) => finish(new Error(`Vite exited before becoming ready (code ${code}). Output:\n${output}`));
    const timer = setTimeout(() => finish(new Error(`Timed out waiting for Vite to report ready on port ${port}. Output:\n${output}`)), timeout);

    devProcess.stdout.on("data", onStdout);
    devProcess.stderr.on("data", onStderr);
    devProcess.on("error", onError);
    devProcess.on("exit", onExit);
  });
}

async function waitForViteReady(devProcess, port, timeout = 60000) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let output = "";

    const finish = (error = null) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      devProcess.stdout.off("data", onStdout);
      devProcess.stderr.off("data", onStderr);
      devProcess.off("error", onError);
      devProcess.off("exit", onExit);
      if (error) {
        reject(error);
      } else {
        resolve(output);
      }
    };

    const handleChunk = (data, writer) => {
      const str = data.toString();
      output += str;
      writer(str);

      if (str.includes("Local:") && (str.includes(`localhost:${port}`) || str.includes(`127.0.0.1:${port}`))) {
        finish();
        return;
      }

      if (/error when starting dev server/i.test(str) || str.includes(`Port ${port} is already in use`)) {
        finish(new Error(`Vite failed before ready on port ${port}: ${str.trim()}`));
      }
    };

    const onStdout = (data) => handleChunk(data, (str) => process.stdout.write(str));
    const onStderr = (data) => handleChunk(data, (str) => process.stderr.write(str));
    const onError = (error) => finish(new Error(`Failed to start Vite server: ${error.message}`));
    const onExit = (code) => finish(new Error(`Vite exited before becoming ready (code ${code}). Output:\n${output}`));
    const timer = setTimeout(() => finish(new Error(`Timed out waiting for Vite to report ready on port ${port}. Output:\n${output}`)), timeout);

    devProcess.stdout.on("data", onStdout);
    devProcess.stderr.on("data", onStderr);
    devProcess.on("error", onError);
    devProcess.on("exit", onExit);
  });
}

async function checkViteInstallation(sharedPackagePath) {
  const vitePath = path.join(sharedPackagePath, "node_modules", ".bin", "vite");
  if (!fs.existsSync(vitePath)) {
    console.error(`  ❌ Vite not found at: ${vitePath}`);
    return false;
  }
  console.log(`  ✅ Vite found at: ${vitePath}`);
  return true;
}

async function checkAndInstallProjectDependencies(projectPath) {
  console.log(`🔍 Analyzing imports in ${path.basename(projectPath)}...`);
  
  const imports = await extractImportsFromProject(projectPath);
  console.log(`  📋 Found imports: ${Array.from(imports).join(', ')}`);
  
  if (imports.size === 0) {
    console.log(`  ⚠️  No external imports found`);
    return true;
  }
  
  const sharedPackagePath = path.join(__dirname, "..", "shared-package");
  const nodeModulesPath = path.join(sharedPackagePath, "node_modules");
  const packageJsonPath = path.join(sharedPackagePath, "package.json");
  
  // Check if package.json exists
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`  ❌ package.json not found in shared package`);
    return false;
  }
  
  // Read current dependencies
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const currentDeps = new Set([
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {})
  ]);
  
  // Find missing dependencies
  const missingDeps = Array.from(imports).filter(dep => {
    // Check if the dependency exists in current dependencies
    if (currentDeps.has(dep)) {
      return false; // Already installed
    }
    
    // For @types packages, also check if the base package is installed
    if (dep.startsWith('@types/')) {
      const basePackage = dep.replace('@types/', '');
      if (currentDeps.has(basePackage)) {
        return false; // Base package is installed, @types might not be needed
      }
    }

    if (dep.startsWith('@/')) {
      return false; // Local mappings
    }
    
    return true; // Missing dependency
  });
  
  if (missingDeps.length > 0) {
    console.log(`  📦 Missing dependencies: ${missingDeps.join(', ')}`);
    console.log(`  📦 Installing missing dependencies...`);
    
    try {
      // Install missing dependencies
      for (const dep of missingDeps) {
        console.log(`    📦 Installing ${dep}...`);
        
        // For @types packages, install as dev dependency
        if (dep.startsWith('@types/')) {
          await execAsync(`npm install ${dep} --save-dev`, { 
            cwd: sharedPackagePath,
            stdio: 'pipe'
          });
        } else {
          await execAsync(`npm install ${dep}`, { 
            cwd: sharedPackagePath,
            stdio: 'pipe'
          });
        }
      }
      console.log(`  ✅ All missing dependencies installed successfully`);
      return true;
    } catch (error) {
      console.error(`  ❌ Failed to install dependencies: ${error.message}`);
      return false;
    }
  } else {
    console.log(`  ✅ All required dependencies are already installed`);
    return true;
  }
}

async function installSharedPackageDependencies() {
  const sharedPackagePath = path.join(__dirname, "..", "shared-package");
  console.log(`📦 Installing shared package dependencies...`);
  
  try {
    const result = await execAsync('npm install', { 
      cwd: sharedPackagePath,
      stdio: 'pipe'
    });
    console.log(`  ✅ Shared package dependencies installed successfully`);
    return true;
  } catch (error) {
    console.error(`  ❌ Failed to install shared package dependencies: ${error.message}`);
    if (error.stdout) {
      console.error(`  stdout: ${error.stdout}`);
    }
    if (error.stderr) {
      console.error(`  stderr: ${error.stderr}`);
    }
    return false;
  }
}

async function clearSharedPackageCache() {
  const sharedPackagePath = path.join(__dirname, "..", "shared-package");
  console.log(`🧹 Clearing shared package cache...`);
  
  try {
    // Clear Vite cache in shared package
    const sharedViteCachePath = path.join(sharedPackagePath, "node_modules", ".vite");
    if (fs.existsSync(sharedViteCachePath)) {
      fs.rmSync(sharedViteCachePath, { recursive: true, force: true });
      console.log(`  ✅ Cleared shared package Vite cache`);
    }

    // Clear TypeScript cache in shared package
    const sharedTsCachePath = path.join(sharedPackagePath, "node_modules", ".cache");
    if (fs.existsSync(sharedTsCachePath)) {
      fs.rmSync(sharedTsCachePath, { recursive: true, force: true });
      console.log(`  ✅ Cleared shared package TypeScript cache`);
    }

  } catch (error) {
    console.warn(`  ⚠️  Warning: Could not clear shared package cache: ${error.message}`);
  }
}

async function clearCache(projectPath) {
  console.log(`🧹 Clearing cache for: ${path.basename(projectPath)}`);
  
  try {
    // Clear Vite cache
    const viteCachePath = path.join(projectPath, "node_modules", ".vite");
    if (fs.existsSync(viteCachePath)) {
      fs.rmSync(viteCachePath, { recursive: true, force: true });
      console.log(`  ✅ Cleared Vite cache`);
    }

    // Clear dist/build directories
    const distPath = path.join(projectPath, "dist");
    if (fs.existsSync(distPath)) {
      fs.rmSync(distPath, { recursive: true, force: true });
      console.log(`  ✅ Cleared dist directory`);
    }

    const buildPath = path.join(projectPath, "build");
    if (fs.existsSync(buildPath)) {
      fs.rmSync(buildPath, { recursive: true, force: true });
      console.log(`  ✅ Cleared build directory`);
    }

    // Clear TypeScript cache
    const tsCachePath = path.join(projectPath, "node_modules", ".cache");
    if (fs.existsSync(tsCachePath)) {
      fs.rmSync(tsCachePath, { recursive: true, force: true });
      console.log(`  ✅ Cleared TypeScript cache`);
    }

  } catch (error) {
    console.warn(`  ⚠️  Warning: Could not clear some cache directories: ${error.message}`);
  }
}

function isProjectDirectory(dirPath) {
  const viteConfigTs = path.join(dirPath, "vite.config.ts");
  const viteConfigJs = path.join(dirPath, "vite.config.js");
  return fs.existsSync(viteConfigTs) || fs.existsSync(viteConfigJs);
}

async function checkForCompilationErrors(page) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const errorInfo = await page.evaluate(() => {
      const errors = [];

      const viteError = document.querySelector("#vite-error-overlay");
      if (viteError) {
        const errorText = viteError.textContent || "";
        errors.push(`Vite Error: ${errorText.substring(0, 200)}`);
      }

      const reactError = document.querySelector("[data-react-error]");
      if (reactError) {
        errors.push("React Error Boundary triggered");
      }

      const errorElements = Array.from(document.querySelectorAll("*"))
        .filter((el) => {
          const text = el.textContent || "";
          return (
            text.includes("Error") ||
            text.includes("Failed") ||
            text.includes("Cannot find module") ||
            text.includes("Module not found") ||
            text.includes("TypeScript") ||
            text.includes("Compilation failed")
          );
        })
        .map((el) => el.textContent.trim().substring(0, 150));

      const bodyText = document.body.textContent || "";
      const hasContent = bodyText.trim().length > 50;

      return {
        hasErrors: errors.length > 0 || errorElements.length > 0,
        errors: [...errors, ...errorElements],
        hasContent,
        bodyTextLength: bodyText.length,
      };
    });

    return errorInfo;
  } catch (error) {
    console.log(`  ⚠️  Error checking for compilation errors: ${error.message}`);
    return { hasErrors: false, errors: [], hasContent: false, bodyTextLength: 0 };
  }
}

async function takeScreenshot(
  url,
  outputPath,
  viewportWidth = 1920,
  credentials = DEFAULT_AUTH_CREDENTIALS
) {
  let browser = null;
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
      ],
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: viewportWidth,
      height: Math.round(viewportWidth * 0.5625),
      deviceScaleFactor: 1,
    });

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.log(`  🔴 Console error: ${msg.text()}`);
      }
    });

    page.on("pageerror", (error) => {
      console.log(`  🔴 Page error: ${error.message}`);
    });

    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });

    const loginSelector = "input[type='password'], input[name*='password' i], input[placeholder*='password' i]";
    const hasLoginForm = await page.evaluate((selector) => Boolean(document.querySelector(selector)), loginSelector);
    if (hasLoginForm) {
      const loginScreenshotPath = buildLoginScreenshotPath(outputPath);
      await page.screenshot({
        path: loginScreenshotPath,
        fullPage: true,
        captureBeyondViewport: true,
      });
      console.log(`  📸 Captured login screen -> ${loginScreenshotPath}`);
    }

    const loginAttempt = await autoLogin(page, credentials);
    if (loginAttempt.attempted && !loginAttempt.submitted) {
      const detail = loginAttempt.reason ? ` (${loginAttempt.reason})` : "";
      console.log(`  ⚠️  Auto-login attempt did not submit a form${detail}.`);
    }

    if (loginAttempt.submitted) {
      try {
        const targetUrl = new URL(url);
        const currentUrl = new URL(page.url());
        if (currentUrl.origin === targetUrl.origin && currentUrl.pathname !== targetUrl.pathname) {
          await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 }).catch(() => {});
        } else if (/login|signin/i.test(currentUrl.pathname)) {
          await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 }).catch(() => {});
        }
      } catch (navigationError) {
        await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 }).catch(() => {});
      }
    }

    if (loginAttempt.attempted) {
      const stillHasPassword = await page.evaluate(() =>
        Boolean(
          document.querySelector(
            "input[type='password'], input[name*='password' i], input[placeholder*='password' i]"
          )
        )
      );
      if (stillHasPassword) {
        console.log("  ⚠️  Auto-login may not have succeeded; password field still present.");
      }
    }

    const errorInfo = await checkForCompilationErrors(page);
    if (errorInfo.hasErrors) {
      console.log("  🔴 Compilation errors detected:");
      errorInfo.errors.forEach((error, index) => {
        console.log(`    ${index + 1}. ${error}`);
      });
    }

    if (!errorInfo.hasContent) {
      console.log(`  ⚠️  Page appears to be empty (${errorInfo.bodyTextLength} characters) - likely compilation failure`);
    }

    let rootFound = false;
    try {
      await page.waitForSelector("#root", { timeout: 10000 });
      rootFound = true;
    } catch (error) {
      console.log("  ⚠️  #root element not found, app may have compilation errors");
    }

    await page.screenshot({
      path: outputPath,
      fullPage: true,
      captureBeyondViewport: true,
    });

    if (!rootFound) {
      console.log("  ⚠️  Screenshot taken without #root element - likely compilation errors");
    }
  } catch (error) {
    console.error("Error taking screenshot:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function sortObjectKeys(obj) {
  return Object.keys(obj)
    .sort((a, b) => a.localeCompare(b))
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
}

function backupFileIfNeeded(filePath, suffix = ".pre-link.bak") {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const backupPath = filePath + suffix;
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
    console.log(`  📋 Backed up ${path.basename(filePath)} to ${path.basename(backupPath)}`);
  }
  return backupPath;
}

async function extractImportsFromProject(projectPath) {
  const srcPath = path.join(projectPath, "src");
  const imports = new Set();

  if (!fs.existsSync(srcPath)) {
    console.log(`  ⚠️  No src directory found in ${path.basename(projectPath)}`);
    return imports;
  }

  function scanDirectory(dir, depth = 0) {
    if (depth > 10) {
      console.warn(`  ⚠️  Max depth reached for directory: ${dir}`);
      return;
    }

    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          scanDirectory(filePath, depth + 1);
        } else if (file.endsWith(".js") || file.endsWith(".jsx") || file.endsWith(".ts") || file.endsWith(".tsx")) {
          try {
            const content = fs.readFileSync(filePath, "utf8");
            extractImportsFromContent(content, imports);
          } catch (error) {
            console.warn(`  ⚠️  Could not read file: ${filePath}`);
          }
        }
      }
    } catch (error) {
      console.warn(`  ⚠️  Could not read directory: ${dir}`);
    }
  }

  scanDirectory(srcPath);
  return imports;
}

function extractImportsFromContent(content, imports) {
  const importPatterns = [
    /import\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"\`]([^'"\`]+)['"\`]/g,
    /import\s+['"\`]([^'"\`]+)['"\`]/g,
    /import\s*\(\s*['"\`]([^'"\`]+)['"\`]\s*\)/g,
    /require\s*\(\s*['"\`]([^'"\`]+)['"\`]\s*\)/g,
  ];

  for (const pattern of importPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const moduleName = match[1];
      if (moduleName && !moduleName.startsWith(".") && !moduleName.startsWith("/")) {
        if (moduleName.startsWith("@")) {
          const parts = moduleName.split("/");
          if (parts.length >= 2) {
            imports.add(`${parts[0]}/${parts[1]}`);
          }
        } else {
          const packageName = moduleName.split("/")[0];
          if (packageName) {
            imports.add(packageName);
          }
        }
      }
    }
  }
}

async function synchronizeProjectPackageJson(projectPath, sharedPackagePath) {
  const sharedPackageJsonPath = path.join(sharedPackagePath, "package.json");
  if (!fs.existsSync(sharedPackageJsonPath)) {
    console.warn(`  ⚠️  Shared package.json not found at ${sharedPackageJsonPath}`);
    return;
  }

  const projectPackageJsonPath = path.join(projectPath, "package.json");

  let projectPackageJson = {};
  if (fs.existsSync(projectPackageJsonPath)) {
    try {
      projectPackageJson = JSON.parse(fs.readFileSync(projectPackageJsonPath, "utf8"));
    } catch (error) {
      console.warn(`  ⚠️  Could not read existing project package.json: ${error.message}`);
    }
  } else {
    projectPackageJson = {
      name: path.basename(projectPath),
      private: true,
      version: "0.0.0",
    };
  }

  let sharedPackageJson = {};
  try {
    sharedPackageJson = JSON.parse(fs.readFileSync(sharedPackageJsonPath, "utf8"));
  } catch (error) {
    console.warn(`  ⚠️  Could not read shared package.json: ${error.message}`);
    return;
  }

  const sharedDependencies = sharedPackageJson.dependencies || {};
  const sharedDevDependencies = sharedPackageJson.devDependencies || {};
  const projectDependencies = projectPackageJson.dependencies || {};
  const projectDevDependencies = projectPackageJson.devDependencies || {};

  const imports = await extractImportsFromProject(projectPath);
  const usedDependencies = new Set([...imports]);
  Object.keys(projectDependencies).forEach((dep) => usedDependencies.add(dep));
  ["react", "react-dom"].forEach((dep) => usedDependencies.add(dep));

  const usedDevDependencies = new Set(Object.keys(projectDevDependencies));
  ["vite", "@vitejs/plugin-react", "typescript", "@types/react", "@types/react-dom"].forEach((dep) =>
    usedDevDependencies.add(dep)
  );

  for (const dep of Array.from(usedDependencies)) {
    if (dep.startsWith("@types/")) {
      usedDependencies.delete(dep);
      usedDevDependencies.add(dep);
    }
  }

  function resolveVersion(dep, preferDev = false) {
    if (!preferDev) {
      return sharedDependencies[dep] || projectDependencies[dep] || sharedDevDependencies[dep] || projectDevDependencies[dep] || null;
    }
    return sharedDevDependencies[dep] || projectDevDependencies[dep] || sharedDependencies[dep] || projectDependencies[dep] || null;
  }

  const resolvedDependencies = {};
  for (const dep of Array.from(usedDependencies).sort((a, b) => a.localeCompare(b))) {
    const version = resolveVersion(dep);
    if (version) {
      resolvedDependencies[dep] = version;
    } else {
      console.warn(`  ⚠️  No version found for dependency '${dep}' in shared or project package.json`);
    }
  }

  const resolvedDevDependencies = {};
  for (const dep of Array.from(usedDevDependencies).sort((a, b) => a.localeCompare(b))) {
    const version = resolveVersion(dep, true);
    if (version) {
      resolvedDevDependencies[dep] = version;
    } else {
      console.warn(`  ⚠️  No version found for devDependency '${dep}' in shared or project package.json`);
    }
  }

  const updatedPackageJson = {
    ...sharedPackageJson,
    name: projectPackageJson.name || sharedPackageJson.name || path.basename(projectPath),
    version: projectPackageJson.version || sharedPackageJson.version || "0.0.0",
    private: projectPackageJson.private ?? sharedPackageJson.private ?? true,
    scripts: projectPackageJson.scripts || sharedPackageJson.scripts,
    dependencies: sortObjectKeys(resolvedDependencies),
    devDependencies: sortObjectKeys(resolvedDevDependencies),
  };

  const newContent = `${JSON.stringify(updatedPackageJson, null, 2)}\n`;
  const currentContent = fs.existsSync(projectPackageJsonPath)
    ? fs.readFileSync(projectPackageJsonPath, "utf8")
    : null;

  if (currentContent === newContent) {
    return;
  }

  backupFileIfNeeded(projectPackageJsonPath);
  fs.writeFileSync(projectPackageJsonPath, newContent, "utf8");
  console.log(`  ✅ Synchronized package.json for ${path.basename(projectPath)}`);
}

function synchronizeProjectTsconfig(projectPath, sharedPackagePath) {
  const sharedTsconfigPath = path.join(sharedPackagePath, "tsconfig.json");
  if (!fs.existsSync(sharedTsconfigPath)) {
    console.warn(`  ⚠️  Shared tsconfig.json not found at ${sharedTsconfigPath}`);
    return;
  }

  const projectTsconfigPath = path.join(projectPath, "tsconfig.json");
  const sharedTsconfigContent = fs.readFileSync(sharedTsconfigPath, "utf8");
  const currentContent = fs.existsSync(projectTsconfigPath)
    ? fs.readFileSync(projectTsconfigPath, "utf8")
    : null;

  if (currentContent === sharedTsconfigContent) {
    return;
  }

  backupFileIfNeeded(projectTsconfigPath);
  fs.copyFileSync(sharedTsconfigPath, projectTsconfigPath);
  console.log(`  ✅ Synchronized tsconfig.json for ${path.basename(projectPath)}`);
}

async function synchronizeProjectConfigs(projectPath, sharedPackagePath) {
  await synchronizeProjectPackageJson(projectPath, sharedPackagePath);
  synchronizeProjectTsconfig(projectPath, sharedPackagePath);
}

function injectPlugin(configPath, pluginImportPath) {
  let config = fs.readFileSync(configPath, "utf8");
  const backupPath = configPath + ".bak";
  fs.writeFileSync(backupPath, config);
  if (!config.includes("vite-plugin-missing-handler")) {
    config = `import missingHandlerPlugin from '${pluginImportPath}';\n` + config;
    config = config.replace(/plugins:\s*\[/, "plugins: [missingHandlerPlugin(), ");
    fs.writeFileSync(configPath, config);
  }
  return backupPath;
}

function replaceWithTemplateConfig(projectPath) {
  const viteConfigTs = path.join(projectPath, "vite.config.ts");
  const viteConfigJs = path.join(projectPath, "vite.config.js");
  const templatePath = path.join(__dirname, "vite-config-template.ts");

  let configPath = null;
  let backupPath = null;

  if (fs.existsSync(viteConfigTs)) {
    configPath = viteConfigTs;
  } else if (fs.existsSync(viteConfigJs)) {
    configPath = viteConfigJs;
  } else {
    console.log("  ⚠️  No Vite config found, creating new one from template");
    configPath = viteConfigTs;
  }

  if (fs.existsSync(configPath)) {
    backupPath = configPath + ".original.bak";
    fs.copyFileSync(configPath, backupPath);
    console.log(`  📋 Backed up original config to ${backupPath}`);
  }

  fs.copyFileSync(templatePath, configPath);
  console.log(`  ✅ Replaced with template config: ${configPath}`);
  return backupPath;
}

function restoreConfig(configPath, backupPath, originalBackupPath = null) {
  if (backupPath && fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, configPath);
    fs.unlinkSync(backupPath);
  }

  if (originalBackupPath && fs.existsSync(originalBackupPath)) {
    fs.copyFileSync(originalBackupPath, configPath);
    fs.unlinkSync(originalBackupPath);
    console.log("  ✅ Restored original config");
  }
}

function createWorkerScript() {
  const workerScript = `
const fs = require("fs");
const path = require("path");
const { spawn, exec, execSync } = require("child_process");
const puppeteer = require("puppeteer");
const net = require("net");
const { promisify } = require("util");

const execAsync = promisify(exec);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function buildLoginScreenshotPath(outputPath) {
  return outputPath.toLowerCase().endsWith(".png") ? outputPath.replace(/\.png$/i, "-login.png") : \`\${outputPath}.login.png\`;
}

const DEFAULT_AUTH_CREDENTIALS = { username: "admin", password: "admin" };

async function autoLogin(page, credentials) {
  if (!credentials) {
    return { attempted: false, submitted: false };
  }

  try {
    const attempt = await page.evaluate(({ username, password }) => {
      const documentRef = document;

      const findElement = (selectors) => {
        for (const selector of selectors) {
          const node = documentRef.querySelector(selector);
          if (node && !node.disabled && node.offsetParent !== null) {
            return node;
          }
        }
        return null;
      };

      const passwordSelectors = [
        "input[type='password']",
        "input[name='password']",
        "input[name*='password' i]",
        "input[placeholder*='password' i]",
      ];

      const usernameSelectors = [
        "input[name='username']",
        "input[name*='user' i]",
        "input[name*='email' i]",
        "input[type='email']",
        "input[placeholder*='user' i]",
        "input[placeholder*='email' i]",
        "input[type='text']",
      ];

      const setValue = (input, value) => {
        if (!input) return;
        const setNativeValue = (element, val) => {
          const { set: valueSetter } = Object.getOwnPropertyDescriptor(element, "value") || {};
          const prototype = Object.getPrototypeOf(element);
          const { set: protoValueSetter } = Object.getOwnPropertyDescriptor(prototype || {}, "value") || {};
          if (protoValueSetter) {
            protoValueSetter.call(element, val);
          } else if (valueSetter) {
            valueSetter.call(element, val);
          } else {
            element.value = val;
          }
        };

        input.focus();
        setNativeValue(input, value);
        try {
          input.setAttribute("value", value);
        } catch (e) {}
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        input.dispatchEvent(new Event("blur", { bubbles: true }));
      };

      const passwordInput = findElement(passwordSelectors);
      if (!passwordInput) {
        return { attempted: false, submitted: false, reason: "no_password_input" };
      }

      let usernameInput = findElement(usernameSelectors);
      if (!usernameInput) {
        const candidateInputs = Array.from(documentRef.querySelectorAll("input"))
          .filter((input) => input !== passwordInput)
          .filter((input) => input.type !== "hidden")
          .filter((input) => !/password/i.test(input.name || "") && !/password/i.test(input.placeholder || ""))
          .filter((input) => !input.disabled && input.offsetParent !== null);
        usernameInput = candidateInputs[0] || null;
      }

      if (usernameInput) {
        setValue(usernameInput, username);
      }
      setValue(passwordInput, password);

      const form = passwordInput.form || (usernameInput && usernameInput.form);
      if (form) {
        if (form.requestSubmit) {
          form.requestSubmit();
        } else {
          form.submit();
        }
        return {
          attempted: true,
          submitted: true,
          method: "form",
        };
      }

      const buttonCandidates = [
        "button[type='submit']",
        "input[type='submit']",
        "button[data-testid*='login']",
        "button[data-test*='login']",
      ];
      let submitButton = findElement(buttonCandidates);

      if (!submitButton) {
        submitButton = Array.from(documentRef.querySelectorAll("button, input[type='button'], input[type='submit']"))
          .find((btn) => {
            const text = (btn.textContent || btn.value || "").toLowerCase();
            return text.includes("login") || text.includes("sign in") || text.includes("signin") || text.includes("submit");
          }) || null;
      }

      if (submitButton) {
        submitButton.click();
        return {
          attempted: true,
          submitted: true,
          method: "button",
        };
      }

      return {
        attempted: true,
        submitted: false,
        reason: "no_submit_button",
      };
    }, credentials);

    if (attempt.attempted) {
      console.log("  🔐 Auto-login attempted using provided credentials.");
    }

    if (attempt.submitted) {
      try {
        await Promise.race([
          page.waitForNavigation({ waitUntil: "networkidle0", timeout: 10000 }),
          new Promise((resolve) => setTimeout(resolve, 1500)),
        ]);
      } catch (navigationError) {}
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return attempt;
  } catch (error) {
    console.log(\`  ⚠️ Auto-login attempt failed: \${error.message}\`);
    return { attempted: false, submitted: false, error: error.message };
  }
}

async function findAvailablePort(startPort = 3000) {
  const server = net.createServer();
  server.unref();
  return new Promise((resolve) => {
    server.on("error", () => {
      server.close();
      resolve(findAvailablePort(startPort + 1));
    });
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}

// Function to get a unique port for each worker
async function getUniquePort(workerIndex) {
  const basePort = 3000 + (workerIndex * 50); // Each worker gets a range of 50 ports (reduced from 100)
  console.log(\`  🔍 Worker \${workerIndex}: Trying port range starting from \${basePort}\`);
  return await findAvailablePort(basePort);
}

async function waitForServer(port, timeout = 60000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const check = setInterval(async () => {
      try {
        const res = await fetch(\`http://localhost:\${port}\`);
        if (res.ok) {
          clearInterval(check);
          resolve();
        }
      } catch (error) {
        // Log error for debugging
        if (Date.now() - startTime > timeout - 5000) {
          console.log(\`  ⏳ Still waiting for server on port \${port}...\`);
        }
      }
      if (Date.now() - startTime > timeout) {
        clearInterval(check);
        reject(new Error(\`Server did not respond on port \${port} within \${timeout/1000}s timeout\`));
      }
    }, 1000); // Check every second instead of 500ms
  });
}

async function checkForCompilationErrors(page) {
  try {
    // Wait for any error overlays or error messages to appear
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const errorInfo = await page.evaluate(() => {
      const errors = [];
      
      // Check for Vite error overlay
      const viteError = document.querySelector('#vite-error-overlay');
      if (viteError) {
        const errorText = viteError.textContent || '';
        errors.push(\`Vite Error: \${errorText.substring(0, 200)}\`);
      }
      
      // Check for React error boundary
      const reactError = document.querySelector('[data-react-error]');
      if (reactError) {
        errors.push('React Error Boundary triggered');
      }
      
      // Check for console errors in the page
      const errorElements = Array.from(document.querySelectorAll('*'))
        .filter(el => {
          const text = el.textContent || '';
          return text.includes('Error') || 
                 text.includes('Failed') || 
                 text.includes('Cannot find module') ||
                 text.includes('Module not found') ||
                 text.includes('TypeScript') ||
                 text.includes('Compilation failed');
        })
        .map(el => el.textContent.trim().substring(0, 150));
      
      // Check if page is mostly empty (indicates compilation failure)
      const bodyText = document.body.textContent || '';
      const hasContent = bodyText.trim().length > 50;
      
      return {
        hasErrors: errors.length > 0 || errorElements.length > 0,
        errors: [...errors, ...errorElements],
        hasContent,
        bodyTextLength: bodyText.length
      };
    });
    
    return errorInfo;
  } catch (error) {
    console.log(\`  ⚠️  Error checking for compilation errors: ${error.message}\`);
    return { hasErrors: false, errors: [], hasContent: false, bodyTextLength: 0 };
  }
}

async function takeScreenshot(url, outputPath, viewportWidth = 1920, credentials = DEFAULT_AUTH_CREDENTIALS) {
  let browser = null;
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox", 
        "--disable-setuid-sandbox",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
        \`--user-data-dir=/tmp/puppeteer-worker-\${workerIndex}\`
      ],
    });
    const page = await browser.newPage();
    
    // Set viewport to specified width for consistent rendering
    await page.setViewport({
      width: viewportWidth,
      height: Math.round(viewportWidth * 0.5625), // 16:9 aspect ratio
      deviceScaleFactor: 1,
    });
    
    // Enable console logging to capture errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(\`  🔴 Console error: \${msg.text()}\`);
      }
    });
    
    // Enable error logging
    page.on('pageerror', error => {
      console.log(\`  🔴 Page error: ${error.message}\`);
    });
    
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });

    const loginAttempt = await autoLogin(page, credentials);
    if (loginAttempt.attempted && !loginAttempt.submitted) {
      const detail = loginAttempt.reason ? \` (\${loginAttempt.reason})\` : "";
      console.log(\`  ⚠️  Auto-login attempt did not submit a form\${detail}.\`);
    }

    if (loginAttempt.submitted) {
      try {
        const targetUrl = new URL(url);
        const currentUrl = new URL(page.url());
        if (
          currentUrl.origin === targetUrl.origin &&
          currentUrl.pathname !== targetUrl.pathname
        ) {
          await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 }).catch(() => {});
        } else if (/login|signin/i.test(currentUrl.pathname)) {
          await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 }).catch(() => {});
        }
      } catch (navigationError) {
        await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 }).catch(() => {});
      }
    }

    if (loginAttempt.attempted) {
      const stillHasPassword = await page.evaluate(() => {
        return Boolean(
          document.querySelector(
            "input[type='password'], input[name*='password' i], input[placeholder*='password' i]"
          )
        );
      });
      if (stillHasPassword) {
        console.log("  ⚠️  Auto-login may not have succeeded; password field still present.");
      }
    }
    
    // Check for compilation errors
    const errorInfo = await checkForCompilationErrors(page);
    
    if (errorInfo.hasErrors) {
      console.log(\`  🔴 Compilation errors detected:\`);
      errorInfo.errors.forEach((error, index) => {
        console.log(\`    \${index + 1}. \${error}\`);
      });
    }
    
    if (!errorInfo.hasContent) {
      console.log(\`  ⚠️  Page appears to be empty (\${errorInfo.bodyTextLength} characters) - likely compilation failure\`);
    }
    
    // Try to wait for #root, but don't fail if it doesn't exist
    let rootFound = false;
    try {
      await page.waitForSelector("#root", { timeout: 10000 });
      rootFound = true;
    } catch (e) {
      console.log("  ⚠️  #root element not found, app may have compilation errors");
    }
    
    // Take screenshot regardless of root element status
    await page.screenshot({ 
      path: outputPath, 
      fullPage: true,
      captureBeyondViewport: true
    });
    
    if (!rootFound) {
      console.log(\`  ⚠️  Screenshot taken without #root element - likely compilation errors\`);
    }
    
  } catch (error) {
    console.error("Error taking screenshot:", error);
  } finally {
    if (browser) await browser.close();
  }
}

function sortObjectKeys(obj) {
  return Object.keys(obj)
    .sort((a, b) => a.localeCompare(b))
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
}

function backupFileIfNeeded(filePath, suffix = ".pre-link.bak") {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const backupPath = filePath + suffix;
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
    console.log("  📋 Backed up " + path.basename(filePath) + " to " + path.basename(backupPath));
  }
  return backupPath;
}

async function extractImportsFromProject(projectPath) {
  const srcPath = path.join(projectPath, "src");
  const imports = new Set();

  if (!fs.existsSync(srcPath)) {
    console.log("  ⚠️  No src directory found in " + path.basename(projectPath));
    return imports;
  }

  function scanDirectory(dir, depth = 0) {
    if (depth > 10) {
      console.warn("  ⚠️  Max depth reached for directory: " + dir);
      return;
    }

    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          scanDirectory(filePath, depth + 1);
        } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            extractImportsFromContent(content, imports);
          } catch (error) {
            console.warn("  ⚠️  Could not read file: " + filePath);
          }
        }
      }
    } catch (error) {
      console.warn("  ⚠️  Could not read directory: " + dir);
    }
  }

  scanDirectory(srcPath);
  return imports;
}

function extractImportsFromContent(content, imports) {
  const importPatterns = [
    /import\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"\`]([^'"\`]+)['"\`]/g,
    /import\s+['"\`]([^'"\`]+)['"\`]/g,
    /import\s*\(\s*['"\`]([^'"\`]+)['"\`]\s*\)/g,
    /require\s*\(\s*['"\`]([^'"\`]+)['"\`]\s*\)/g
  ];

  for (const pattern of importPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const moduleName = match[1];
      if (moduleName && !moduleName.startsWith('.') && !moduleName.startsWith('/')) {
        if (moduleName.startsWith('@')) {
          const parts = moduleName.split('/');
          if (parts.length >= 2) {
            const scopedPackage = parts[0] + '/' + parts[1];
            imports.add(scopedPackage);
          }
        } else {
          const packageName = moduleName.split('/')[0];
          if (packageName) {
            imports.add(packageName);
          }
        }
      }
    }
  }
}

async function synchronizeProjectPackageJson(projectPath, sharedPackagePath) {
  const sharedPackageJsonPath = path.join(sharedPackagePath, "package.json");
  if (!fs.existsSync(sharedPackageJsonPath)) {
    console.warn("  ⚠️  Shared package.json not found at " + sharedPackageJsonPath);
    return;
  }

  const projectPackageJsonPath = path.join(projectPath, "package.json");

  let projectPackageJson = {};
  if (fs.existsSync(projectPackageJsonPath)) {
    try {
      projectPackageJson = JSON.parse(fs.readFileSync(projectPackageJsonPath, "utf8"));
    } catch (error) {
      console.warn("  ⚠️  Could not read existing project package.json: " + error.message);
    }
  } else {
    projectPackageJson = {
      name: path.basename(projectPath),
      private: true,
      version: "0.0.0",
    };
  }

  let sharedPackageJson = {};
  try {
    sharedPackageJson = JSON.parse(fs.readFileSync(sharedPackageJsonPath, "utf8"));
  } catch (error) {
    console.warn("  ⚠️  Could not read shared package.json: " + error.message);
    return;
  }

  const sharedDependencies = sharedPackageJson.dependencies || {};
  const sharedDevDependencies = sharedPackageJson.devDependencies || {};

  const projectDependencies = projectPackageJson.dependencies || {};
  const projectDevDependencies = projectPackageJson.devDependencies || {};

  const imports = await extractImportsFromProject(projectPath);
  const usedDependencies = new Set(imports);

  Object.keys(projectDependencies).forEach((dep) => usedDependencies.add(dep));

  const ALWAYS_INCLUDE_DEPENDENCIES = ["react", "react-dom"];
  ALWAYS_INCLUDE_DEPENDENCIES.forEach((dep) => usedDependencies.add(dep));

  const usedDevDependencies = new Set(Object.keys(projectDevDependencies));
  const ALWAYS_INCLUDE_DEV_DEPENDENCIES = ["vite", "@vitejs/plugin-react", "typescript", "@types/react", "@types/react-dom"];
  ALWAYS_INCLUDE_DEV_DEPENDENCIES.forEach((dep) => usedDevDependencies.add(dep));

  for (const dep of Array.from(usedDependencies)) {
    if (dep.startsWith("@types/")) {
      usedDependencies.delete(dep);
      usedDevDependencies.add(dep);
    }
  }

  function resolveVersion(dep, preferDev = false) {
    if (!preferDev) {
      if (sharedDependencies[dep]) return sharedDependencies[dep];
      if (projectDependencies[dep]) return projectDependencies[dep];
      if (sharedDevDependencies[dep]) return sharedDevDependencies[dep];
      if (projectDevDependencies[dep]) return projectDevDependencies[dep];
    } else {
      if (sharedDevDependencies[dep]) return sharedDevDependencies[dep];
      if (projectDevDependencies[dep]) return projectDevDependencies[dep];
      if (sharedDependencies[dep]) return sharedDependencies[dep];
      if (projectDependencies[dep]) return projectDependencies[dep];
    }
    return null;
  }

  const resolvedDependencies = {};
  Array.from(usedDependencies)
    .sort((a, b) => a.localeCompare(b))
    .forEach((dep) => {
      const version = resolveVersion(dep);
      if (version) {
        resolvedDependencies[dep] = version;
      } else {
        console.warn("  ⚠️  No version found for dependency '" + dep + "' in shared or project package.json");
      }
    });

  const resolvedDevDependencies = {};
  Array.from(usedDevDependencies)
    .sort((a, b) => a.localeCompare(b))
    .forEach((dep) => {
      const version = resolveVersion(dep, true);
      if (version) {
        resolvedDevDependencies[dep] = version;
      } else {
        console.warn("  ⚠️  No version found for devDependency '" + dep + "' in shared or project package.json");
      }
    });

  const updatedPackageJson = {
    ...sharedPackageJson,
    name: projectPackageJson.name || sharedPackageJson.name || path.basename(projectPath),
    version: projectPackageJson.version || sharedPackageJson.version || "0.0.0",
    private: projectPackageJson.private ?? sharedPackageJson.private ?? true,
    scripts: projectPackageJson.scripts || sharedPackageJson.scripts,
    dependencies: sortObjectKeys(resolvedDependencies),
    devDependencies: sortObjectKeys(resolvedDevDependencies),
  };

  const newContent = JSON.stringify(updatedPackageJson, null, 2) + '\n';
  const currentContent = fs.existsSync(projectPackageJsonPath)
    ? fs.readFileSync(projectPackageJsonPath, "utf8")
    : null;

  if (currentContent === newContent) {
    return;
  }

  backupFileIfNeeded(projectPackageJsonPath);
  fs.writeFileSync(projectPackageJsonPath, newContent, "utf8");
  console.log("  ✅ Synchronized package.json for " + path.basename(projectPath));
}

function synchronizeProjectTsconfig(projectPath, sharedPackagePath) {
  const sharedTsconfigPath = path.join(sharedPackagePath, "tsconfig.json");
  if (!fs.existsSync(sharedTsconfigPath)) {
    console.warn("  ⚠️  Shared tsconfig.json not found at " + sharedTsconfigPath);
    return;
  }

  const projectTsconfigPath = path.join(projectPath, "tsconfig.json");
  const sharedTsconfigContent = fs.readFileSync(sharedTsconfigPath, "utf8");
  const currentContent = fs.existsSync(projectTsconfigPath)
    ? fs.readFileSync(projectTsconfigPath, "utf8")
    : null;

  if (currentContent === sharedTsconfigContent) {
    return;
  }

  backupFileIfNeeded(projectTsconfigPath);
  fs.copyFileSync(sharedTsconfigPath, projectTsconfigPath);
  console.log("  ✅ Synchronized tsconfig.json for " + path.basename(projectPath));
}

async function synchronizeProjectConfigs(projectPath, sharedPackagePath) {
  await synchronizeProjectPackageJson(projectPath, sharedPackagePath);
  synchronizeProjectTsconfig(projectPath, sharedPackagePath);
}

function injectPlugin(configPath, pluginImportPath) {
  let config = fs.readFileSync(configPath, "utf8");
  let backupPath = configPath + ".bak";
  fs.writeFileSync(backupPath, config);
  if (!config.includes("vite-plugin-missing-handler")) {
    config = \`import missingHandlerPlugin from '\${pluginImportPath}';\n\` + config;
    config = config.replace(/plugins:\\s*\\[/, "plugins: [missingHandlerPlugin(), ");
    fs.writeFileSync(configPath, config);
  }
  return backupPath;
}

function replaceWithTemplateConfig(projectPath) {
  const viteConfigTs = path.join(projectPath, "vite.config.ts");
  const viteConfigJs = path.join(projectPath, "vite.config.js");
  const templatePath = path.join(__dirname, "vite-config-template.ts");
  
  let configPath = null;
  let backupPath = null;
  
  // Determine which config file exists
  if (fs.existsSync(viteConfigTs)) {
    configPath = viteConfigTs;
  } else if (fs.existsSync(viteConfigJs)) {
    configPath = viteConfigJs;
  } else {
    console.log(\`  ⚠️  No Vite config found, creating new one from template\`);
    configPath = viteConfigTs;
  }
  
  // Create backup of original config if it exists
  if (fs.existsSync(configPath)) {
    backupPath = configPath + ".original.bak";
    fs.copyFileSync(configPath, backupPath);
    console.log(\`  📋 Backed up original config to \${backupPath}\`);
  }
  
  // Copy template config
  fs.copyFileSync(templatePath, configPath);
  console.log(\`  ✅ Replaced with template config: \${configPath}\`);
  
  return backupPath;
}

function restoreConfig(configPath, backupPath, originalBackupPath = null) {
  // Restore plugin backup first (if exists)
  if (backupPath && fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, configPath);
    fs.unlinkSync(backupPath);
  }
  
  // Restore original config backup (if exists)
  if (originalBackupPath && fs.existsSync(originalBackupPath)) {
    fs.copyFileSync(originalBackupPath, configPath);
    fs.unlinkSync(originalBackupPath);
    console.log(\`  ✅ Restored original config\`);
  }
}

async function renderProject(projectPath, outputDir, sharedPackagePath, workerIndex, tempDir, viewportWidth = 1920, credentials = DEFAULT_AUTH_CREDENTIALS) {
  
  const projectName = path.basename(projectPath);
  const outputPath = path.join(outputDir, \`\${projectName}.png\`);
  
  // Check if source project exists
  if (!fs.existsSync(projectPath)) {
    console.error(\`  ❌ Source project directory does not exist: \${projectPath}\`);
    return { success: false, error: \`Source project directory does not exist: \${projectPath}\` };
  }
  
  // Create a unique lock file for this project to prevent conflicts
  const lockFile = path.join(projectPath, \`.render-lock-\${workerIndex}\`);
  const isolatedProjectPath = projectPath;
  
  try {
    // Create lock file to prevent other workers from accessing this project
    fs.writeFileSync(lockFile, JSON.stringify({ workerIndex, timestamp: Date.now() }));
    console.log(\`  🔒 Created lock file for \${projectName} (worker \${workerIndex})\`);
  } catch (error) {
    console.error(\`  ❌ Failed to create lock file: ${error.message}\`);
    return { success: false, error: \`Failed to create lock file: ${error.message}\` };
  }
  
  // Replace with template config in isolated directory
  const originalBackupPath = replaceWithTemplateConfig(isolatedProjectPath);
  
  const viteConfigTs = path.join(isolatedProjectPath, "vite.config.ts");
  const viteConfigJs = path.join(isolatedProjectPath, "vite.config.js");
  let configPath = null;
  
  if (fs.existsSync(viteConfigTs)) configPath = viteConfigTs;
  else if (fs.existsSync(viteConfigJs)) configPath = viteConfigJs;
  else {
    return { success: false, error: "No Vite config found" };
  }

  const pluginSrc = path.join(__dirname, "vite-plugin-missing-handler.ts");
  const pluginDest = path.join(isolatedProjectPath, "vite-plugin-missing-handler.ts");
  fs.copyFileSync(pluginSrc, pluginDest);

  const relPluginPath = "./vite-plugin-missing-handler";
  //const backupPath = injectPlugin(configPath, relPluginPath);

  const sharedPackageNodeModulesPath = path.join(sharedPackagePath, "node_modules");
  const projectNodeModulesPath = path.join(isolatedProjectPath, "node_modules");
  
  if (!fs.existsSync(projectNodeModulesPath)) {
    try {
      fs.symlinkSync(sharedPackageNodeModulesPath, projectNodeModulesPath, "dir");
    } catch (error) {
      if (error.code !== 'EEXIST') {
        console.error("Failed to create symlink:", error);
      }
    }
  }

  await synchronizeProjectConfigs(isolatedProjectPath, sharedPackagePath);

  const port = await getUniquePort(workerIndex);
  console.log(\`  🔌 Using port \${port} for \${path.basename(projectPath)} (worker \${workerIndex})\`);
  
  const vitePath = path.join(sharedPackagePath, "node_modules", ".bin", "vite");
  
  // Check if Vite binary exists
  if (!fs.existsSync(vitePath)) {
    console.error(\`  ❌ Vite binary not found at: \${vitePath}\`);
    return { success: false, error: "Vite binary not found" };
  }
  
  const nodeExecutable = resolveNodeExecutable();
  console.log(\`  🚀 Starting Vite server: \${nodeExecutable} \${vitePath} --port \${port}\`);
  const devProcess = spawn(nodeExecutable, [vitePath, "--port", String(port), "--strictPort"], {
    cwd: isolatedProjectPath,
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });

  try {
    await waitForViteReady(devProcess, port, 60000);
    console.log(\`  ✅ Server is responding on port \${port}\`);
    await waitForServer(port, 10000);
    await new Promise((res) => setTimeout(res, 3000));
    
    await takeScreenshot(\`http://localhost:\${port}\`, outputPath, viewportWidth, credentials);
    return { success: true, outputPath };
  } catch (e) {
    return { success: false, error: e.message };
  } finally {
    devProcess.kill();
    restoreConfig(configPath, null, originalBackupPath);
    if (fs.existsSync(pluginDest)) fs.unlinkSync(pluginDest);
    
    // Clean up lock file
    try {
      if (fs.existsSync(lockFile)) {
        fs.unlinkSync(lockFile);
        console.log(\`  🔓 Removed lock file for \${projectName}\`);
      }
    } catch (error) {
      console.warn(\`  ⚠️  Could not remove lock file: ${error.message}\`);
    }
  }
}

// Worker process main function
const {
  projectPath,
  outputDir,
  sharedPackagePath,
  workerIndex,
  tempDir,
  viewportWidth,
  credentials: credentialOverrides,
} = JSON.parse(process.argv[2]);

const resolvedCredentials = {
  username: credentialOverrides && credentialOverrides.username ? credentialOverrides.username : DEFAULT_AUTH_CREDENTIALS.username,
  password: credentialOverrides && credentialOverrides.password ? credentialOverrides.password : DEFAULT_AUTH_CREDENTIALS.password,
};

renderProject(projectPath, outputDir, sharedPackagePath, workerIndex, tempDir, viewportWidth, resolvedCredentials)
  .then(result => {
    process.send({ projectPath, ...result });
    process.exit(0);
  })
  .catch(error => {
    process.send({ projectPath, success: false, error: error.message });
    process.exit(1);
  });
`;

  const workerPath = path.join(__dirname, "worker.js");
  fs.writeFileSync(workerPath, workerScript);
  return workerPath;
}

async function renderProjectsParallel(
  projectPaths,
  outputDir,
  maxConcurrency = null,
  viewportWidth = 1920,
  credentials = DEFAULT_AUTH_CREDENTIALS
) {
  if (!maxConcurrency) {
    maxConcurrency = Math.min(os.cpus().length, 4); // Use CPU cores but cap at 4
  }
  
  console.log(`🚀 Starting parallel rendering with ${maxConcurrency} workers`);
  console.log(`📊 Port allocation: Each worker gets a range of 50 ports (3000-3049, 3050-3099, etc.)`);
  
  const sharedPackagePath = path.join(__dirname, "..", "shared-package");
  const workerPath = createWorkerScript();
  
  const results = [];
  let successCount = 0;
  let failureCount = 0;
  let completedCount = 0;
  
  // Process projects in batches with proper isolation
  for (let i = 0; i < projectPaths.length; i += maxConcurrency) {
    const batch = projectPaths.slice(i, i + maxConcurrency);
    const promises = batch.map((projectPath, batchIndex) => {
      const workerIndex = i + batchIndex; // Global worker index
      return new Promise((resolve) => {
        // Create a unique temporary directory for this worker to avoid conflicts
        const tempDir = path.join(os.tmpdir(), `render-worker-${workerIndex}-${Date.now()}`);
        
        const worker = fork(workerPath, [JSON.stringify({
          projectPath,
          outputDir,
          sharedPackagePath,
          workerIndex,
          tempDir, // Pass temp directory for isolation
          viewportWidth: viewportWidth, // Pass viewport width
          credentials
        })], {
          silent: true
        });
        
        worker.on('message', (result) => {
          completedCount++;
          console.log(`[${completedCount}/${projectPaths.length}] ${result.success ? '✅' : '❌'} ${path.basename(projectPath)}`);
          
          if (result.success) {
            successCount++;
          } else {
            failureCount++;
            console.error(`  Error: ${result.error}`);
          }
          
          results.push(result);
          resolve(result);
        });
        
        worker.on('error', (error) => {
          completedCount++;
          failureCount++;
          console.error(`❌ Worker error for ${path.basename(projectPath)}: ${error.message}`);
          results.push({ projectPath, success: false, error: error.message });
          resolve({ projectPath, success: false, error: error.message });
        });
        
        worker.on('exit', (code) => {
          if (code !== 0) {
            console.error(`❌ Worker exited with code ${code} for ${path.basename(projectPath)}`);
          }
        });
      });
    });
    
    // Wait for current batch to complete before starting next batch
    await Promise.all(promises);
    
    // Add a minimal delay between batches to prevent resource contention
    if (i + maxConcurrency < projectPaths.length) {
      console.log(`⏳ Batch completed, waiting 500ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Clean up worker script
  if (fs.existsSync(workerPath)) {
    fs.unlinkSync(workerPath);
  }
  
  return { results, successCount, failureCount };
}

async function renderSingleProject(projectPath, outputTarget, width, routesOption, credentials = DEFAULT_AUTH_CREDENTIALS) {
  console.log(`\n🚀 Rendering project: ${projectPath}`);
  
  const projectName = path.basename(projectPath);
  const widthToUse = width || 1920;
  const resolvedOutputTarget = outputTarget || path.join(projectPath, "screenshots");
  const isFileOutput = isPngFilePath(resolvedOutputTarget);
  const captureMultipleRoutes = Boolean(routesOption);
  const screenshotDirectory = isFileOutput ? path.dirname(resolvedOutputTarget) : resolvedOutputTarget;

  if (screenshotDirectory) {
    fs.mkdirSync(screenshotDirectory, { recursive: true });
  }
  
  // Replace with template config
  const originalBackupPath = replaceWithTemplateConfig(projectPath);
  
  const viteConfigTs = path.join(projectPath, "vite.config.ts");
  const viteConfigJs = path.join(projectPath, "vite.config.js");
  let configPath = null;
  
  if (fs.existsSync(viteConfigTs)) configPath = viteConfigTs;
  else if (fs.existsSync(viteConfigJs)) configPath = viteConfigJs;
  else {
    console.error(`❌ No vite.config.ts or vite.config.js found in project: ${projectPath}`);
    return { success: false, error: "No Vite config found" };
  }

  // Copy plugin to project if not present
  const pluginSrc = path.join(__dirname, "vite-plugin-missing-handler.ts");
  const pluginDest = path.join(projectPath, "vite-plugin-missing-handler.ts");
  fs.copyFileSync(pluginSrc, pluginDest);

  // Inject plugin
  const relPluginPath = "./vite-plugin-missing-handler";
  // const backupPath = injectPlugin(configPath, relPluginPath);

  // Link the shared-package node_modules to the project
  const sharedPackagePath = path.join(__dirname, "..", "shared-package");
  const sharedPackageNodeModulesPath = path.join(
    sharedPackagePath,
    "node_modules"
  );
  const projectNodeModulesPath = path.join(projectPath, "node_modules");
  
  if (!fs.existsSync(projectNodeModulesPath)) {
    try {
      fs.symlinkSync(sharedPackageNodeModulesPath, projectNodeModulesPath, "dir");
    } catch (error) {
      if (error.code !== 'EEXIST') {
        console.error("Failed to create symlink:", error);
      }
    }
  }

  await synchronizeProjectConfigs(projectPath, sharedPackagePath);

  const port = await findAvailablePort();
  console.log(`  🔌 Using port ${port} for ${path.basename(projectPath)}`);
  
  const vitePath = path.join(__dirname, "..", "shared-package", "node_modules", ".bin", "vite");
  const nodeExecutable = resolveNodeExecutable();
  console.log(`  🚀 Starting Vite server: ${nodeExecutable} ${vitePath} --port ${port}`);
  const devProcess = spawn(nodeExecutable, [vitePath, "--port", String(port), "--strictPort"], {
    cwd: projectPath,
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });

  try {
    await waitForViteReady(devProcess, port, 60000);
    await waitForServer(port, 10000);
    await new Promise((res) => setTimeout(res, 5000));
    if (captureMultipleRoutes) {
      const routesToCapture = resolveRouteList(routesOption, projectPath);
      console.log(`  🧭 Routes to capture: ${routesToCapture.join(", ")}`);
      const usedNames = new Set();
      const capturedPaths = [];
      const failures = [];

      for (const route of routesToCapture) {
        const urlSuffix = route === "/" ? "" : route;
        const safeName = sanitizeRouteToFilename(route, usedNames);
        const screenshotPath = path.join(screenshotDirectory, `${safeName}.png`);
        console.log(`  📸 Capturing route '${route}' -> ${screenshotPath}`);
        await takeScreenshot(`http://localhost:${port}${urlSuffix}`, screenshotPath, widthToUse, credentials);
        if (fs.existsSync(screenshotPath)) {
          capturedPaths.push(screenshotPath);
        } else {
          failures.push(route);
        }
      }

      if (failures.length > 0) {
        console.error(`  ❌ Failed to capture routes: ${failures.join(", ")}`);
      } else {
        console.log(`✅ Captured ${capturedPaths.length} route screenshot(s).`);
      }

      return {
        success: failures.length === 0,
        outputPaths: capturedPaths,
        failedRoutes: failures,
      };
    }

    const baseOutput = isFileOutput
      ? resolvedOutputTarget
      : path.join(resolvedOutputTarget, `${projectName}.png`);
    console.log(`  📸 Capturing default route -> ${baseOutput}`);
    await takeScreenshot(`http://localhost:${port}`, baseOutput, widthToUse, credentials);
    if (!fs.existsSync(baseOutput)) {
      throw new Error("Screenshot file was not created");
    }
    console.log(`✅ Successfully rendered: ${baseOutput}`);
    return { success: true, outputPaths: [baseOutput] };
  } catch (e) {
    console.error(`❌ Failed to render project ${projectPath}:`, e.message);
    return { success: false, error: e.message };
  } finally {
    devProcess.kill();
    restoreConfig(configPath, null, originalBackupPath);
    if (fs.existsSync(pluginDest)) fs.unlinkSync(pluginDest);
  }
}

async function run() {
  const { project, projects, output, concurrency, width, routes, username, password } = parseArgs();
  const credentials = {
    username: typeof username === "string" && username !== true && username.length > 0
      ? username
      : DEFAULT_AUTH_CREDENTIALS.username,
    password: typeof password === "string" && password !== true && password.length > 0
      ? password
      : DEFAULT_AUTH_CREDENTIALS.password,
  };
  
  // Support both single project and multiple projects
  if (!output) {
    console.error(
      "Usage: node render-project.js --project <projectPath> --output <outputPathOrDir> [--routes auto|/custom,/paths] [--width <pixels>] [--username <user>] [--password <pass>]"
    );
    console.error("   OR: node render-project.js --projects <globPattern> --output <outputDir> [--concurrency <number>] [--width <pixels>] [--username <user>] [--password <pass>]"
    );
    console.error("Examples:");
    console.error("  node render-project.js --project 'selected-project/complex-spa' --output ./screenshot.png --width 1920");
    console.error("  node render-project.js --project 'selected-project/complex-spa' --output ./selected-project/complex-spa/screenshots --routes auto --username admin --password admin");
    console.error("  node render-project.js --projects 'selected-project/*' --output ./screenshots --width 1440");
    console.error("  node render-project.js --projects '**/complex-*' --output ./output --concurrency 4 --width 1920");
    process.exit(1);
  }

  // Single project mode
  if (project) {
    if (!fs.existsSync(project)) {
      console.error(`❌ Project directory not found: ${project}`);
      process.exit(1);
    }
    
    if (!isProjectDirectory(project)) {
      console.error(`❌ Not a valid Vite project: ${project}`);
      process.exit(1);
    }

    console.log(`🚀 Rendering single project: ${project}`);
    
    // Check and install project-specific dependencies first
    console.log(`🔍 Checking dependencies for ${path.basename(project)}...`);
    // Temporarily skip dependency checking to debug the issue
    console.log(`⚠️  Skipping dependency check for debugging`);
    const depsInstalled = await checkAndInstallProjectDependencies(project);
    if (!depsInstalled) {
      console.error(`❌ Failed to install project dependencies`);
      // process.exit(1);
    }
    
    // Check Vite installation
    const sharedPackagePath = path.join(__dirname, "..", "shared-package");
    const viteInstalled = await checkViteInstallation(sharedPackagePath);
    if (!viteInstalled) {
      console.error(`❌ Vite not properly installed, aborting render`);
      process.exit(1);
    }
    
    // Clear shared package cache first
    await clearSharedPackageCache();
    
    // Clear project cache
    await clearCache(project);
    
    const result = await renderSingleProject(project, output, width, routes, credentials);
    
    if (result.success) {
      const captured = (result.outputPaths || []).map((p) => path.resolve(p));
      if (captured.length > 0) {
        console.log(`✅ Successfully rendered ${captured.length} screenshot(s):`);
        captured.forEach((filePath) => console.log(`   • ${filePath}`));
      } else {
        console.log("✅ Render completed but no screenshot paths were reported.");
      }
      process.exit(0);
    } else {
      const failedRoutes = (result.failedRoutes || []).join(", ");
      if (failedRoutes) {
        console.error(`❌ Failed routes: ${failedRoutes}`);
      }
      console.error(`❌ Failed to render project: ${result.error || "unknown error"}`);
      process.exit(1);
    }
  }

  // Multiple projects mode
  if (!projects) {
    console.error("❌ Either --project or --projects parameter is required");
    process.exit(1);
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(output)) {
    fs.mkdirSync(output, { recursive: true });
  }

  // Find all matching directories
  console.log(`🔍 Searching for directories matching pattern: ${projects}`);
  const projectPaths = glob.sync(projects, { 
    absolute: true, 
    onlyDirectories: true 
  });

  if (projectPaths.length === 0) {
    console.error(`❌ No directories found matching pattern: ${projects}`);
    process.exit(1);
  }

  console.log(`📁 Found ${projectPaths.length} directories matching pattern: ${projects}`);
  
  // Filter to only include valid project directories
  const validProjects = projectPaths.filter(isProjectDirectory);
  
  if (validProjects.length === 0) {
    console.error(`❌ No valid Vite projects found in the matching directories`);
    process.exit(1);
  }

  console.log(`🎯 Found ${validProjects.length} valid Vite projects to render`);

  // Check and install dependencies for each project (sequentially, not in parallel)
  console.log(`🔍 Checking dependencies for all projects...`);
  for (const projectPath of validProjects) {
    const depsInstalled = await checkAndInstallProjectDependencies(projectPath);
    if (!depsInstalled) {
      console.error(`❌ Failed to install dependencies for ${path.basename(projectPath)}`);
      // Remove the project from the list to skip it
      // const index = validProjects.indexOf(projectPath);
      // if (index > -1) {
      //   validProjects.splice(index, 1);
      // }
    }
  }

  if (validProjects.length === 0) {
    console.error(`❌ No projects with valid dependencies found`);
    process.exit(1);
  }

  console.log(`✅ Dependency check completed for ${validProjects.length} projects`);

  // Check Vite installation
  const sharedPackagePath = path.join(__dirname, "..", "shared-package");
  const viteInstalled = await checkViteInstallation(sharedPackagePath);
  if (!viteInstalled) {
    console.error(`❌ Vite not properly installed, aborting render`);
    process.exit(1);
  }

  // Clear shared package cache once before processing all projects
  await clearSharedPackageCache();

  // Parse concurrency setting
  const maxConcurrency = concurrency ? parseInt(concurrency) : null;
  
  // Use parallel rendering for multiple projects
  const { results, successCount, failureCount } = await renderProjectsParallel(
    validProjects,
    output,
    maxConcurrency,
    width || 1920,
    credentials,
  );

  // Summary
  console.log(`\n📊 Rendering Summary:`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📁 Output directory: ${output}`);

  if (failureCount > 0) {
    console.log(`\n❌ Failed projects:`);
    results
      .filter(r => !r.success)
      .forEach(r => console.log(`  - ${path.basename(r.projectPath)}: ${r.error}`));
  }

  process.exit(failureCount > 0 ? 1 : 0);
}

run();
