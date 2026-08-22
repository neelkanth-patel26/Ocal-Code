import { ToolchainInfo, BuildResult, DiagnosticItem, LanguageTarget } from './ide';

export interface ElectronAPI {
  detectToolchains: () => Promise<ToolchainInfo[]>;
  checkSyntax: (options: {
    sourceCode: string;
    fileName: string;
    language: LanguageTarget;
    compilerPath?: string;
    standard?: string;
  }) => Promise<DiagnosticItem[]>;
  compile: (options: {
    sourceCode: string;
    fileName: string;
    language: LanguageTarget;
    compilerPath?: string;
    standard?: string;
    optimization?: string;
    warnings?: string[];
    customFlags?: string;
  }) => Promise<BuildResult>;
  runExecutable: (binaryPath: string) => Promise<{ success: boolean; pid?: number; error?: string }>;
  sendInput: (input: string) => Promise<boolean>;
  writeTerminal: (data: string) => Promise<boolean>;
  killProcess: () => Promise<boolean>;

  // Interactive General Shell Terminal Session
  startTerminalSession: (cwd?: string) => Promise<boolean>;
  sendTerminalInput: (data: string) => Promise<boolean>;
  restartTerminalSession: (cwd?: string) => Promise<boolean>;
  killTerminalProcess: () => Promise<boolean>;

  generateAssembly: (options: {
    sourceCode: string;
    fileName: string;
    language: LanguageTarget;
    compilerPath?: string;
    standard?: string;
  }) => Promise<{ success: boolean; assembly?: string; error?: string }>;

  openFileDialog: () => Promise<{ path: string; name: string; content: string; language: LanguageTarget } | null>;
  saveFileDialog: (options: { defaultName: string; content: string; language?: LanguageTarget }) => Promise<{ path: string; name: string } | null>;
  saveFile: (options: { filePath: string; content: string }) => Promise<boolean>;

  openFolderDialog: () => Promise<string | null>;
  readFolderTree: (dirPath: string) => Promise<import('./ide').FileTreeNode[]>;
  readFileByPath: (filePath: string) => Promise<{ path: string; name: string; content: string; language: LanguageTarget } | null>;
  saveFileByPath: (filePath: string, content: string) => Promise<boolean>;
  createFileInWorkspace: (parentPath: string, fileName: string) => Promise<boolean>;
  createFolderInWorkspace: (parentPath: string, folderName: string) => Promise<boolean>;
  deleteWorkspaceItem: (targetPath: string) => Promise<boolean>;

  startLiveServer: (port?: number) => Promise<{ port: number; url: string }>;
  stopLiveServer: () => Promise<void>;
  updateLiveServerFiles: (files: Array<{ name: string; content: string; language?: string }>) => Promise<boolean>;
  getLiveServerStatus: () => Promise<{ running: boolean; port: number; url: string }>;
  openExternalUrl: (url: string) => Promise<boolean>;

  onTerminalData: (callback: (data: string) => void) => () => void;
  onProcessExit: (callback: (data: { code: number | null; signal: string | null }) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
