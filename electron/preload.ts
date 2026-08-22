import { contextBridge, ipcRenderer } from 'electron';

export const electronAPI = {
  detectToolchains: () => ipcRenderer.invoke('compiler:detect-toolchains'),
  checkSyntax: (options: any) => ipcRenderer.invoke('compiler:check-syntax', options),
  compile: (options: any) => ipcRenderer.invoke('compiler:compile', options),
  runExecutable: (binaryPath: string) => ipcRenderer.invoke('compiler:run', binaryPath),
  sendInput: (input: string) => ipcRenderer.invoke('compiler:send-input', input),
  writeTerminal: (data: string) => ipcRenderer.invoke('terminal:write', data),
  killProcess: () => ipcRenderer.invoke('compiler:kill'),
  generateAssembly: (options: any) => ipcRenderer.invoke('compiler:generate-assembly', options),

  openFileDialog: () => ipcRenderer.invoke('fs:open-file-dialog'),
  saveFileDialog: (options: { defaultName: string; content: string; language?: string }) =>
    ipcRenderer.invoke('fs:save-file-dialog', options),
  saveFile: (options: { filePath: string; content: string }) =>
    ipcRenderer.invoke('fs:save-file', options),

  // Live Web Server API
  startLiveServer: (port?: number) => ipcRenderer.invoke('live-server:start', port),
  stopLiveServer: () => ipcRenderer.invoke('live-server:stop'),
  updateLiveServerFiles: (files: any[]) => ipcRenderer.invoke('live-server:update-files', files),
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
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
