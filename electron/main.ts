import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { compilerManager, CompileOptions } from './compiler';
import { liveServerManager, LiveServerFile } from './liveServer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, '../public');

let win: BrowserWindow | null;
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Ocal Code',
    icon: path.join(process.env.VITE_PUBLIC || path.join(__dirname, '../public'), 'icon.svg'),
    backgroundColor: '#0c0c0c',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#121318',
      symbolColor: '#cccccc',
      height: 40,
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(process.env.DIST!, 'index.html'));
  }
}

app.on('window-all-closed', () => {
  compilerManager.killRunningProcess();
  liveServerManager.stop();
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(async () => {
  createWindow();

  // Auto-start Local Live HTTP Web Server on port 5500
  try {
    await liveServerManager.start(5500);
  } catch (err: any) {
    console.error('Error starting live server:', err.message);
  }

  // IPC Handlers: Live Server & External Browser
  ipcMain.handle('live-server:start', async (_, port?: number) => {
    return await liveServerManager.start(port || 5500);
  });

  ipcMain.handle('live-server:stop', async () => {
    return await liveServerManager.stop();
  });

  ipcMain.handle('live-server:update-files', async (_, files: LiveServerFile[]) => {
    liveServerManager.updateFiles(files);
    return true;
  });

  ipcMain.handle('live-server:status', async () => {
    return liveServerManager.getStatus();
  });

  ipcMain.handle('shell:open-external', async (_, url: string) => {
    if (url) {
      await shell.openExternal(url);
      return true;
    }
    return false;
  });

  // IPC Handlers: Toolchain & Compiler
  ipcMain.handle('compiler:detect-toolchains', async () => {
    return await compilerManager.detectToolchains();
  });

  ipcMain.handle('compiler:check-syntax', async (_, options: CompileOptions) => {
    return await compilerManager.checkSyntax(options);
  });

  ipcMain.handle('compiler:compile', async (_, options: CompileOptions) => {
    return await compilerManager.compile(options);
  });

  ipcMain.handle('compiler:run', async (_, binaryPath: string) => {
    if (!win) return { success: false, error: 'Window not initialized' };

    return compilerManager.runExecutable(
      binaryPath,
      (data: string) => {
        win?.webContents.send('terminal:data', data);
      },
      (code: number | null, signal: string | null) => {
        win?.webContents.send('process:exit', { code, signal });
      }
    );
  });

  ipcMain.handle('compiler:send-input', async (_, input: string) => {
    return compilerManager.sendInputToProcess(input);
  });

  ipcMain.handle('compiler:kill', async () => {
    return compilerManager.killRunningProcess();
  });

  ipcMain.handle('compiler:generate-assembly', async (_, options: CompileOptions) => {
    return await compilerManager.generateAssembly(options);
  });

  ipcMain.handle('terminal:write', async (_, data: string) => {
    win?.webContents.send('terminal:data', data);
    return true;
  });

  // IPC Handlers: File System Dialogs
  ipcMain.handle('fs:open-file-dialog', async () => {
    if (!win) return null;
    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: [
        {
          name: 'All Supported Source Files',
          extensions: ['html', 'htm', 'css', 'js', 'ts', 'tsx', 'jsx', 'py', 'java', 'cpp', 'c', 'h', 'hpp', 'json', 'txt'],
        },
        { name: 'HTML Web Documents (*.html, *.htm)', extensions: ['html', 'htm'] },
        { name: 'CSS Stylesheets (*.css)', extensions: ['css'] },
        { name: 'Python Scripts (*.py)', extensions: ['py', 'pyw'] },
        { name: 'Java Source Files (*.java)', extensions: ['java'] },
        { name: 'JavaScript & TypeScript (*.js, *.ts, *.tsx, *.jsx)', extensions: ['js', 'ts', 'tsx', 'jsx'] },
        { name: 'C/C++ Source Files (*.cpp, *.c, *.h, *.hpp)', extensions: ['cpp', 'c', 'cc', 'cxx', 'h', 'hpp'] },
        { name: 'All Files (*.*)', extensions: ['*'] },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const filePath = result.filePaths[0];
    const content = await fs.promises.readFile(filePath, 'utf8');
    const name = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    let language = 'cpp';
    if (ext === '.html' || ext === '.htm') language = 'html';
    else if (ext === '.css') language = 'css';
    else if (ext === '.py' || ext === '.pyw') language = 'python';
    else if (ext === '.java') language = 'java';
    else if (ext === '.js' || ext === '.mjs' || ext === '.cjs') language = 'javascript';
    else if (ext === '.ts') language = 'typescript';
    else if (ext === '.tsx' || ext === '.jsx') language = 'react';
    else if (ext === '.c') language = 'c';
    else language = 'cpp';

    return {
      path: filePath,
      name,
      content,
      language,
    };
  });

  ipcMain.handle('fs:save-file-dialog', async (_, options: { defaultName: string; content: string; language?: string }) => {
    if (!win) return null;

    const ext = path.extname(options.defaultName).toLowerCase().replace(/^\./, '');
    const lang = options.language?.toLowerCase() || '';

    let filters: Array<{ name: string; extensions: string[] }> = [];

    if (lang === 'html' || ext === 'html' || ext === 'htm') {
      filters = [
        { name: 'HTML Web Document (*.html, *.htm)', extensions: ['html', 'htm'] },
        { name: 'CSS Stylesheet (*.css)', extensions: ['css'] },
        { name: 'JavaScript (*.js)', extensions: ['js'] },
        { name: 'All Files (*.*)', extensions: ['*'] },
      ];
    } else if (lang === 'css' || ext === 'css') {
      filters = [
        { name: 'CSS Stylesheet (*.css)', extensions: ['css'] },
        { name: 'HTML Web Document (*.html)', extensions: ['html', 'htm'] },
        { name: 'All Files (*.*)', extensions: ['*'] },
      ];
    } else if (lang === 'python' || ext === 'py' || ext === 'pyw') {
      filters = [
        { name: 'Python Script (*.py, *.pyw)', extensions: ['py', 'pyw'] },
        { name: 'All Files (*.*)', extensions: ['*'] },
      ];
    } else if (lang === 'java' || ext === 'java') {
      filters = [
        { name: 'Java Source File (*.java)', extensions: ['java'] },
        { name: 'All Files (*.*)', extensions: ['*'] },
      ];
    } else if (lang === 'javascript' || ext === 'js' || ext === 'mjs') {
      filters = [
        { name: 'JavaScript File (*.js, *.mjs)', extensions: ['js', 'mjs'] },
        { name: 'TypeScript File (*.ts)', extensions: ['ts'] },
        { name: 'All Files (*.*)', extensions: ['*'] },
      ];
    } else if (lang === 'typescript' || ext === 'ts') {
      filters = [
        { name: 'TypeScript File (*.ts)', extensions: ['ts'] },
        { name: 'JavaScript File (*.js)', extensions: ['js'] },
        { name: 'All Files (*.*)', extensions: ['*'] },
      ];
    } else if (lang === 'react' || lang === 'nextjs' || ext === 'tsx' || ext === 'jsx') {
      filters = [
        { name: 'React / Next.js Component (*.tsx, *.jsx)', extensions: ['tsx', 'jsx', 'ts', 'js'] },
        { name: 'TypeScript File (*.ts)', extensions: ['ts'] },
        { name: 'All Files (*.*)', extensions: ['*'] },
      ];
    } else if (lang === 'c' || ext === 'c') {
      filters = [
        { name: 'C Source Files (*.c, *.h)', extensions: ['c', 'h'] },
        { name: 'C++ Source Files (*.cpp, *.hpp)', extensions: ['cpp', 'hpp'] },
        { name: 'All Files (*.*)', extensions: ['*'] },
      ];
    } else {
      filters = [
        { name: 'C++ Source Files (*.cpp, *.cxx, *.hpp, *.h)', extensions: ['cpp', 'cxx', 'hpp', 'h'] },
        { name: 'C Source Files (*.c, *.h)', extensions: ['c', 'h'] },
        { name: 'All Files (*.*)', extensions: ['*'] },
      ];
    }

    const result = await dialog.showSaveDialog(win, {
      defaultPath: options.defaultName,
      filters,
    });

    if (result.canceled || !result.filePath) {
      return null;
    }

    await fs.promises.writeFile(result.filePath, options.content, 'utf8');
    return {
      path: result.filePath,
      name: path.basename(result.filePath),
    };
  });

  ipcMain.handle('fs:save-file', async (_, options: { filePath: string; content: string }) => {
    await fs.promises.writeFile(options.filePath, options.content, 'utf8');
    return true;
  });

  // ========================================================
  // WORKSPACE FOLDER & MULTI-FILE PROJECT HANDLERS
  // ========================================================
  const IGNORED_FOLDERS = new Set([
    'node_modules',
    '.git',
    'dist',
    'dist-electron',
    'build',
    'release',
    '.next',
    'temp',
    '__pycache__',
    '.vscode',
    '.idea',
    'bin',
    'obj',
  ]);

  async function scanDirectoryTree(dirPath: string, depth = 0, maxDepth = 6): Promise<any[]> {
    if (depth > maxDepth) return [];
    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      const nodes = [];

      for (const entry of entries) {
        if (entry.name.startsWith('.') && entry.name !== '.env') continue;
        if (IGNORED_FOLDERS.has(entry.name)) continue;

        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          const children = await scanDirectoryTree(fullPath, depth + 1, maxDepth);
          nodes.push({
            path: fullPath,
            name: entry.name,
            isDirectory: true,
            children,
          });
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          nodes.push({
            path: fullPath,
            name: entry.name,
            isDirectory: false,
            extension: ext,
          });
        }
      }

      return nodes.sort((a, b) => {
        if (a.isDirectory === b.isDirectory) {
          return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        }
        return a.isDirectory ? -1 : 1;
      });
    } catch (err) {
      console.error('Error scanning folder:', dirPath, err);
      return [];
    }
  }

  function detectLanguageFromPath(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.py' || ext === '.pyw') return 'python';
    if (ext === '.java') return 'java';
    if (ext === '.html' || ext === '.htm') return 'html';
    if (ext === '.css' || ext === '.scss' || ext === '.sass' || ext === '.less') return 'css';
    if (ext === '.js' || ext === '.mjs' || ext === '.cjs') return 'javascript';
    if (ext === '.ts') return 'typescript';
    if (ext === '.tsx' || ext === '.jsx') return 'react';
    if (ext === '.c') return 'c';
    return 'cpp';
  }

  ipcMain.handle('fs:open-folder-dialog', async () => {
    if (!win) return null;
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
      title: 'Open Project Folder - Ocal Code',
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });

  ipcMain.handle('fs:read-folder-tree', async (_, dirPath: string) => {
    return await scanDirectoryTree(dirPath);
  });

  ipcMain.handle('fs:read-file-by-path', async (_, filePath: string) => {
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      const name = path.basename(filePath);
      const language = detectLanguageFromPath(filePath);
      return { path: filePath, name, content, language };
    } catch (err) {
      console.error('Error reading file:', filePath, err);
      return null;
    }
  });

  ipcMain.handle('fs:save-file-by-path', async (_, filePath: string, content: string) => {
    try {
      await fs.promises.writeFile(filePath, content, 'utf8');
      return true;
    } catch (err) {
      console.error('Error saving file:', filePath, err);
      return false;
    }
  });

  ipcMain.handle('fs:create-file', async (_, parentPath: string, fileName: string) => {
    try {
      const fullPath = path.join(parentPath, fileName);
      await fs.promises.writeFile(fullPath, '', { flag: 'wx' });
      return true;
    } catch (err) {
      console.error('Error creating file:', parentPath, fileName, err);
      return false;
    }
  });

  ipcMain.handle('fs:create-folder', async (_, parentPath: string, folderName: string) => {
    try {
      const fullPath = path.join(parentPath, folderName);
      await fs.promises.mkdir(fullPath, { recursive: true });
      return true;
    } catch (err) {
      console.error('Error creating directory:', parentPath, folderName, err);
      return false;
    }
  });

  ipcMain.handle('fs:delete-item', async (_, targetPath: string) => {
    try {
      const stat = await fs.promises.stat(targetPath);
      if (stat.isDirectory()) {
        await fs.promises.rm(targetPath, { recursive: true, force: true });
      } else {
        await fs.promises.unlink(targetPath);
      }
      return true;
    } catch (err) {
      console.error('Error deleting item:', targetPath, err);
      return false;
    }
  });
});
