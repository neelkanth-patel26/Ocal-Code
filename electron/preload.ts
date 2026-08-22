import { contextBridge, ipcRenderer } from 'electron';

export const electronAPI = {
  detectToolchains: () => ipcRenderer.invoke('compiler:detect-toolchains'),
  checkSyntax: (options: any) => ipcRenderer.invoke('compiler:check-syntax', options),
  compile: (options: any) => ipcRenderer.invoke('compiler:compile', options),
  runExecutable: (binaryPath: string) => ipcRenderer.invoke('compiler:run', binaryPath),
  sendInput: (input: string) => ipcRenderer.invoke('compiler:send-input', input),
  writeTerminal: (data: string) => ipcRenderer.invoke('terminal:write', data),
  killProcess: () => ipcRenderer.invoke('compiler:kill'),

  // Real PTY Shell Terminal Session (node-pty / ConPTY)
  startTerminalSession: (cwd?: string, cols?: number, rows?: number) =>
    ipcRenderer.invoke('terminal:start-session', cwd, cols, rows),
  sendTerminalInput: (data: string) => ipcRenderer.invoke('terminal:send-data', data),
  resizeTerminal: (cols: number, rows: number) =>
    ipcRenderer.invoke('terminal:resize', cols, rows),
  restartTerminalSession: (cwd?: string, cols?: number, rows?: number) =>
    ipcRenderer.invoke('terminal:restart-session', cwd, cols, rows),
  killTerminalProcess: () => ipcRenderer.invoke('terminal:kill-session'),

  generateAssembly: (options: any) => ipcRenderer.invoke('compiler:generate-assembly', options),

  openFileDialog: () => ipcRenderer.invoke('fs:open-file-dialog'),
  saveFileDialog: (options: { defaultName: string; content: string; language?: string }) =>
    ipcRenderer.invoke('fs:save-file-dialog', options),
  saveFile: (options: { filePath: string; content: string }) =>
    ipcRenderer.invoke('fs:save-file', options),

  // Workspace & Project Folder API
  openFolderDialog: () => ipcRenderer.invoke('fs:open-folder-dialog'),
  readFolderTree: (dirPath: string) => ipcRenderer.invoke('fs:read-folder-tree', dirPath),
  readFileByPath: (filePath: string) => ipcRenderer.invoke('fs:read-file-by-path', filePath),
  saveFileByPath: (filePath: string, content: string) => ipcRenderer.invoke('fs:save-file-by-path', filePath, content),
  createFileInWorkspace: (parentPath: string, fileName: string) =>
    ipcRenderer.invoke('fs:create-file', parentPath, fileName),
  createFolderInWorkspace: (parentPath: string, folderName: string) =>
    ipcRenderer.invoke('fs:create-folder', parentPath, folderName),
  deleteWorkspaceItem: (targetPath: string) => ipcRenderer.invoke('fs:delete-item', targetPath),

  // Live Web Server API
  startLiveServer: (port?: number) => ipcRenderer.invoke('live-server:start', port),
  stopLiveServer: () => ipcRenderer.invoke('live-server:stop'),
  updateLiveServerFiles: (files: any[], workspaceDir?: string) =>
    ipcRenderer.invoke('live-server:update-files', files, workspaceDir),
  getLiveServerStatus: () => ipcRenderer.invoke('live-server:status'),
  openExternalUrl: (url: string) => ipcRenderer.invoke('shell:open-external', url),

  onTerminalData: (callback: (data: string) => void) => {
    const handler = (_: any, data: string) => callback(data);
    ipcRenderer.on('terminal:data', handler);
    return () => ipcRenderer.removeListener('terminal:data', handler);
  },

  onProcessExit: (callback: (data: { code: number | null; signal: string | null }) => void) => {
    const handler = (_: any, data: { code: number | null; signal: string | null }) => callback(data);
    ipcRenderer.on('process:exit', handler);
    return () => ipcRenderer.removeListener('process:exit', handler);
  },

  // Auto-Update API (Ocal Browser Pattern)
  checkForUpdates: () => ipcRenderer.invoke('check-for-update'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  applyUpdate: (installerPath: string) => ipcRenderer.send('apply-update', installerPath),
  onUpdateDownloadProgress: (callback: (progress: { percent: number; loaded: string; total: string }) => void) => {
    const handler = (_: any, data: { percent: number; loaded: string; total: string }) => callback(data);
    ipcRenderer.on('update-download-progress', handler);
    return () => ipcRenderer.removeListener('update-download-progress', handler);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
