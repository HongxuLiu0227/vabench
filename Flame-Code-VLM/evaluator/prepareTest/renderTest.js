const { extractDependenciesFromCode } = require("../../utils/dependencyAnalyzer.js");
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const net = require('net');
// const { runCommand } = require('../utils');
const { exec, spawn } = require('child_process');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// === CONFIGURATION FLAG ===
const USE_JSONL = true; // Set to true to use JSONL file and refactored_code
const JSONL_FIELD = 'code_with_ori_img';
// const JSONL_FIELD = 'refactored_code';
// const JSONL_PATH = path.join(__dirname, '../../..', 'refactor/samples/output_data_50thread.jsonl');
const JSONL_PATH = path.join(__dirname, '../../..', 'output/merged_augmented.jsonl');
const JSON_PATH = path.join(__dirname, 'testDataEN80.json');
const OUTPUT_DIR = USE_JSONL ? 'imgs_augmented' : 'imgs';

// load jsonl file
function loadTestCode(path) {
  // load json data
  const fileContents = fs.readFileSync(path, 'utf8');
  const testData = JSON.parse(fileContents);
  return testData;
}

function runCommand(path, cmd) {
  return new Promise((resolve, reject) => {
    // const command = 'npm cache clean --force';
    console.log('run command: ', cmd);
    exec(cmd, { cwd: path }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return resolve(false);
      }
      console.log(`stdout: ${stdout}`);
      console.log('cmd success.');
      resolve(true);
    });
  });
}

async function clearProject(templateProjectPath) {
  await runCommand(templateProjectPath, 'npm cache clean --force');
  await runCommand(templateProjectPath, 'rm -rf package-lock.json');
  await runCommand(templateProjectPath, 'rm -rf ' + path.join(templateProjectPath, 'src', 'components', '*'));
}

function writeblankPackageJson(templateProjectPath) {
  const packageTemplate = {
    "name": "",
    "version": "0.1.0",
    "private": true,
    "scripts": {
      "start": "react-scripts start --watch-options-poll=1000",
      "build": "react-scripts build",
      "test": "react-scripts test",
      "eject": "react-scripts eject"
    },
    "browserslist": {
      "production": [
        ">0.2%",
        "not dead",
        "not op_mini all"
      ],
      "development": [
        "last 1 chrome version",
        "last 1 firefox version",
        "last 1 safari version"
      ]
    }
  }
  console.log('writing package.json', path.join(templateProjectPath, 'package.json'));
  try {
    fs.writeFileSync(path.join(templateProjectPath, 'package.json'), JSON.stringify(packageTemplate, null, 2));
  } catch (e) {
    console.log('writting package.json error: ', e);
  }
}

function installDependencies(projectPath, dependencies) {
  if (dependencies.length === 0) {
    return Promise.resolve(true);
  }
  return new Promise((resolve, reject) => {
    const command = `npm install ${dependencies.join(' ')}`;

    exec(command, { cwd: projectPath }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error installing dependencies: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        return resolve(false);
      }
      console.log(`stdout: ${stdout}`);
      console.log('Dependencies installed successfully.');
      resolve(true);
    });
  });
}

async function findAvailablePort(startPort = 3000) { // delay in milliseconds
  const server = net.createServer();
  server.unref();
  return new Promise((resolve, reject) => {
    server.on('error', (e) => {
      server.close();
      resolve(this.findAvailablePort(startPort + 1));
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
        const response = await fetch(`http://localhost:${port}`);
        if (response.ok) {
          clearInterval(check);
          resolve();
        }
      } catch (error) {
        // Ignore connection errors, just retry
      }
      if (Date.now() - startTime > timeout) {
        clearInterval(check);
        reject(new Error(`Server did not respond on port ${port} within timeout`));
      }
    }, 500);
  });
}

async function startServer(projectPath, port, timeoutMs = 30000) {
  return new Promise((resolve) => {
    const command = 'npm';
    const args = ['run', 'start'];
    const startProcess = spawn(command, args, {
      cwd: projectPath,
      env: { ...process.env, PORT: String(port) },
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        try {
          process.kill(-startProcess.pid, 'SIGKILL'); // kill process group
        } catch (e) {}
        stopServer(port).then(() => {
          console.error('Start server timeout, skipping.');
          resolve(false);
        });
      }
    }, timeoutMs);

    function finish(success) {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        if (!success) {
          try {
            process.kill(-startProcess.pid, 'SIGKILL'); // kill process group only on failure
          } catch (e) {}
          stopServer(port).then(() => {
            resolve(success);
          });
        } else {
          // On success, do not kill the process group here!
          resolve(success);
        }
      }
    }

    startProcess.stdout.on('data', async (data) => {
      const str = data.toString();
      console.log(`stdout: ${str}`);
      if (str.includes('Compiled successfully')) {
        try {
          await waitForServer(port);
          console.log('Project started successfully on port', port);
          finish(true);
        } catch (error) {
          console.error('Error: ', error.message);
          finish(false);
        }
      }
      if (str.includes('Failed to compile') || str.includes('ERROR in') || str.includes('Something is already running on port')) {
        console.error('Detected compile error or port in use.');
        finish(false);
      }
    });

    startProcess.stderr.on('data', (data) => {
      const str = data.toString();
      console.error(`stderr: ${str}`);
      if (str.includes('Failed to compile') || str.includes('ERROR in') || str.includes('Something is already running on port')) {
        console.error('Detected compile error or port in use.');
        finish(false);
      }
    });

    startProcess.on('error', (error) => {
      console.error(`Error starting project: ${error.message}`);
      finish(false);
    });
  });
}

function stopServer(port) {
  return new Promise((resolve) => {
    exec(`lsof -t -i:${port}`, (error, stdout) => {
      if (error) {
        // No process found, treat as success
        console.log(`No server running on port ${port}.`);
        return resolve(false);
      }

      const pid = stdout.trim();
      if (pid) {
        exec(`kill -9 ${pid}`, (killError) => {
          if (killError) {
            console.error(`Error stopping server: ${killError.message}`);
            return resolve(false);
          }
          console.log(`Server on port ${port} stopped successfully.`);
          resolve(true);
        });
      } else {
        console.log(`No server running on port ${port}.`);
        resolve(false);
      }
    });
  });
}

async function takeScreenshot(url, outputPath) {
  let browser = null;
  try {
    browser = await puppeteer.launch({
      // executablePath: '/usr/bin/chromium-browser',
      // executablePath: '/bin/google-chrome',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    // await page.goto(url, { waitUntil: 'networkidle0' });
    // await page.goto(url, { waitUntil: 'load', timeout: 60000 });

    // Wait for the React root or a specific selector that indicates the page is rendered
    // Adjust '#root' to a selector that is always present in your rendered app
    try {
      await page.waitForSelector('#root', { timeout: 30000 });
    } catch (e) {
      console.error('Timeout waiting for #root to appear, page may not have rendered.');
    }

    // Optionally, check for error text in the page
    const pageContent = await page.content();
    if (pageContent.includes('Failed to compile') || pageContent.includes('Something went wrong')) {
      console.error('Build/render error detected in page content, skipping screenshot.');
      return;
    }

    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });

    await page.evaluate(() => {
      document.body.style.overflow = 'visible';
      document.documentElement.style.overflow = 'visible';
    });
    await page.screenshot({ path: outputPath, fullPage: true });
  } catch (error) {
    console.error('Error taking screenshot:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function extractDependenciesInPackageJson(packageJsonPath) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = Object.keys(packageJson.dependencies || {});
  return dependencies;
}

// Add JSONL loader
function loadTestCodeFromJSONL(filePath) {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return fileContents
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line));
}

// Replace the main run function
async function run() {
  const testData = USE_JSONL ? loadTestCodeFromJSONL(JSONL_PATH) : loadTestCode(JSON_PATH);
  const outputPath = path.join(__dirname, OUTPUT_DIR);

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  const templateProjectPath = path.join(__dirname, 'template');

  for (const item of testData) {
    // Use refactored_code if using JSONL, otherwise use component
    const code = USE_JSONL ? item[JSONL_FIELD] : item.component;
    const style = item.style || '';
    // Use id or problem_id for output naming
    const id = String(item.id || item.problem_id || (item.comp_name_in_file !== undefined && item.iter_num !== undefined   && item.task_idx !== undefined && item.total_task_num !== undefined ? `${item.comp_name_in_file}-${item.iter_num}-${item.task_idx}-${item.total_task_num}` : Math.random().toString(36).substring(2, 10)));

    const outputImgPath = path.join(outputPath, id);
    const outputImgName = `${id}.png`;
    const outputImgFullPath = path.join(outputImgPath, outputImgName);

    // Skip if image already exists
    if (fs.existsSync(outputImgFullPath)) {
      console.log(`Image already exists for id ${id}, skipping.`);
      continue;
    }

    await clearProject(templateProjectPath);

    const componentPath = path.join(templateProjectPath, 'src', 'components');
    if (!fs.existsSync(componentPath)) {
      fs.mkdirSync(componentPath, { recursive: true });
    }
    fs.writeFileSync(path.join(componentPath, 'style.css'), style);
    fs.writeFileSync(path.join(componentPath, 'component.jsx'), 'import "./style.css"\n' + code);

    const dependencies = extractDependenciesFromCode(code);
    const dependenciesInPackageJson = extractDependenciesInPackageJson(path.join(templateProjectPath, 'package.json'));
    const diff = dependencies.filter(dep => !dependenciesInPackageJson.includes(dep));

    let bugFree = await installDependencies(templateProjectPath, diff);
    if (!bugFree) {
      console.log(`Dependency install failed for id ${id}, skipping.`);
      continue;
    }
    const port = await findAvailablePort();
    await stopServer(port);
    const startBugFree = await startServer(templateProjectPath, port);
    console.log(`[INFO] startServer returned: ${startBugFree} for id ${id} on port ${port}`);
    if (!startBugFree) {
      console.log(`Project failed to compile for id ${id}, skipping.`);
      continue;
    }
    if (!fs.existsSync(outputImgPath)) {
      fs.mkdirSync(outputImgPath, { recursive: true });
    }
    const url = `http://localhost:${port}`;
    console.log(`[INFO] Waiting 10s before taking screenshot for id ${id} at ${url}`);
    await new Promise(resolve => setTimeout(resolve, 10000));
    try {
      await takeScreenshot(url, outputImgFullPath);
    } catch (e) {
      console.error(`Failed to take screenshot for id ${id}:`, e);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    await stopServer(port);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log('All done.');
}

run();