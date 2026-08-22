import { create } from 'zustand';
import {
  FileItem,
  DiagnosticItem,
  CompilerConfig,
  ToolchainInfo,
  BuildResult,
  BottomTabType,
  ThemeName,
  LanguageTarget,
} from '../types/ide';
import { CODE_TEMPLATES } from '../templates/defaultSnippets';

interface IDEState {
  // Files
  files: FileItem[];
  activeFileId: string;
  showProjectLauncher: boolean;
  setShowProjectLauncher: (show: boolean) => void;
  setActiveFileId: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  addNewFile: (name?: string, language?: LanguageTarget, content?: string) => string;
  closeFile: (id: string) => void;
  saveCurrentFile: () => Promise<void>;
  openFileFromDisk: () => Promise<void>;
  loadTemplate: (templateId: string) => void;

  // Diagnostics
  diagnostics: DiagnosticItem[];
  setDiagnostics: (diags: DiagnosticItem[]) => void;
  clearDiagnostics: () => void;

  // Compiler Configuration & Toolchains
  compilerConfig: CompilerConfig;
  setCompilerConfig: (config: Partial<CompilerConfig>) => void;
  toolchains: ToolchainInfo[];
  setToolchains: (toolchains: ToolchainInfo[]) => void;

  // Process & Execution Lifecycle
  isCompiling: boolean;
  isRunning: boolean;
  lastBuildResult: BuildResult | null;
  lastBinaryPath: string | null;
  activePid: number | null;
  assemblyCode: string | null;
  
  setIsCompiling: (val: boolean) => void;
  setIsRunning: (val: boolean) => void;
  setLastBuildResult: (result: BuildResult | null) => void;
  setLastBinaryPath: (path: string | null) => void;
  setActivePid: (pid: number | null) => void;
  setAssemblyCode: (asm: string | null) => void;

  // Terminal & Console Logs
  buildLogs: string[];
  addBuildLog: (log: string) => void;
  clearBuildLogs: () => void;

  // UI Panels & Theme
  activeBottomTab: BottomTabType;
  setActiveBottomTab: (tab: BottomTabType) => void;
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  sidebarTab: 'explorer' | 'templates' | 'problems' | 'settings';
  setSidebarTab: (tab: 'explorer' | 'templates' | 'problems' | 'settings') => void;
  sidebarWidth: number;
  setSidebarWidth: (w: number) => void;
  bottomPanelHeight: number;
  setBottomPanelHeight: (h: number) => void;
  showShortcutsModal: boolean;
  setShowShortcutsModal: (show: boolean) => void;
  showSettingsModal: boolean;
  setShowSettingsModal: (show: boolean) => void;
  showAboutModal: boolean;
  setShowAboutModal: (show: boolean) => void;

  // Cursor position
  cursorPos: { line: number; column: number };
  setCursorPos: (pos: { line: number; column: number }) => void;
}

const defaultFile: FileItem = {
  id: 'file-default-1',
  name: 'main.cpp',
  language: 'cpp',
  content: CODE_TEMPLATES[0].code,
  isDirty: false,
};

const getDefaultLanguageInfo = (lang: LanguageTarget): { ext: string; content: string } => {
  switch (lang) {
    case 'html':
      return {
        ext: '.html',
        content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Ocal++ Web</title>\n</head>\n<body>\n  <h1>Hello from Ocal++ Live Web!</h1>\n</body>\n</html>\n',
      };
    case 'css':
      return {
        ext: '.css',
        content: '/* Modern CSS */\nbody {\n  margin: 0;\n  font-family: sans-serif;\n  background: #0f172a;\n  color: #f8fafc;\n}\n',
      };
    case 'python':
      return {
        ext: '.py',
        content: '# Python 3 Program\n\ndef main():\n    name = input("Enter your name: ")\n    print(f"Hello, {name} from Ocal++ Python!")\n\nif __name__ == "__main__":\n    main()\n',
      };
    case 'java':
      return {
        ext: '.java',
        content: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        System.out.print("Enter your name: ");\n        String name = scanner.nextLine();\n        System.out.println("Hello, " + name + " from Ocal++ Java!");\n        scanner.close();\n    }\n}\n',
      };
    case 'javascript':
      return {
        ext: '.js',
        content: '// JavaScript (Node.js)\nconsole.log("Hello from Ocal++ JavaScript!");\n',
      };
    case 'typescript':
      return {
        ext: '.ts',
        content: '// TypeScript\ninterface Developer {\n  name: string;\n  role: string;\n}\n\nconst dev: Developer = { name: "Ocal User", role: "Software Engineer" };\nconsole.log(`Hello, ${dev.name} (${dev.role}) from Ocal++ TypeScript!`);\n',
      };
    case 'react':
      return {
        ext: '.tsx',
        content: 'import React, { useState } from "react";\n\nexport const App: React.FC = () => {\n  const [count, setCount] = useState(0);\n  return (\n    <div className="p-4 text-center">\n      <h1 className="text-xl font-bold">Ocal++ React Studio</h1>\n      <p className="my-2">Count: {count}</p>\n      <button onClick={() => setCount(count + 1)} className="px-3 py-1 bg-sky-500 text-white rounded">\n        Increment\n      </button>\n    </div>\n  );\n};\n\nexport default App;\n',
      };
    case 'nextjs':
      return {
        ext: '.tsx',
        content: '// Next.js App Router Page\nimport React from "react";\n\nexport default function Page() {\n  return (\n    <main className="p-8">\n      <h1 className="text-2xl font-bold">Next.js Page</h1>\n      <p>Rendered with Ocal++ Studio</p>\n    </main>\n  );\n}\n',
      };
    case 'c':
      return {
        ext: '.c',
        content: '#include <stdio.h>\n\nint main(void) {\n    printf("Hello from Ocal++ C!\\n");\n    return 0;\n}\n',
      };
    case 'cpp':
    default:
      return {
        ext: '.cpp',
        content: '#include <iostream>\n\nint main() {\n    std::cout << "Hello from Ocal++ C++!\\n";\n    return 0;\n}\n',
      };
  }
};

export const useIDEStore = create<IDEState>((set, get) => ({
  files: [],
  activeFileId: '',
  showProjectLauncher: true,
  setShowProjectLauncher: (show: boolean) => set({ showProjectLauncher: show }),

  setActiveFileId: (id: string) => {
    set({ activeFileId: id, showProjectLauncher: false });
  },

  updateFileContent: (id: string, content: string) => {
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, content, isDirty: true } : f
      ),
    }));
  },

  addNewFile: (name?: string, language?: LanguageTarget, content?: string) => {
    const lang = language || 'cpp';
    const langInfo = getDefaultLanguageInfo(lang);
    const count = get().files.length + 1;
    const fileName = name || (lang === 'java' ? 'Main.java' : lang === 'html' ? 'index.html' : `source_${count}${langInfo.ext}`);
    const newFile: FileItem = {
      id: `file-${Date.now()}`,
      name: fileName,
      language: lang,
      content: content !== undefined ? content : langInfo.content,
      isDirty: false,
    };

    set((state) => ({
      files: [...state.files, newFile],
      activeFileId: newFile.id,
      showProjectLauncher: false,
    }));
    return newFile.id;
  },

  closeFile: (id: string) => {
    const { files, activeFileId } = get();
    const newFiles = files.filter((f) => f.id !== id);

    if (newFiles.length === 0) {
      set({ files: [], activeFileId: '', showProjectLauncher: true });
      return;
    }

    let nextActiveId = activeFileId;
    if (activeFileId === id) {
      const closedIndex = files.findIndex((f) => f.id === id);
      const nextFile = newFiles[Math.max(0, closedIndex - 1)];
      nextActiveId = nextFile.id;
    }

    set({ files: newFiles, activeFileId: nextActiveId });
  },

  saveCurrentFile: async () => {
    const { files, activeFileId } = get();
    const activeFile = files.find((f) => f.id === activeFileId);
    if (!activeFile) return;

    if (window.electronAPI) {
      if (activeFile.path) {
        await window.electronAPI.saveFile({
          filePath: activeFile.path,
          content: activeFile.content,
        });
        set((state) => ({
          files: state.files.map((f) =>
            f.id === activeFileId ? { ...f, isDirty: false } : f
          ),
        }));
      } else {
        const result = await window.electronAPI.saveFileDialog({
          defaultName: activeFile.name,
          content: activeFile.content,
          language: activeFile.language,
        });
        if (result) {
          set((state) => ({
            files: state.files.map((f) =>
              f.id === activeFileId
                ? { ...f, name: result.name, path: result.path, isDirty: false }
                : f
            ),
          }));
        }
      }
    } else {
      // Web fallback: download as file
      const blob = new Blob([activeFile.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = activeFile.name;
      a.click();
      URL.revokeObjectURL(url);
      set((state) => ({
        files: state.files.map((f) =>
          f.id === activeFileId ? { ...f, isDirty: false } : f
        ),
      }));
    }
  },

  openFileFromDisk: async () => {
    if (window.electronAPI) {
      const opened = await window.electronAPI.openFileDialog();
      if (opened) {
        const existing = get().files.find((f) => f.path === opened.path);
        if (existing) {
          set({ activeFileId: existing.id, showProjectLauncher: false });
        } else {
          const newFile: FileItem = {
            id: `file-disk-${Date.now()}`,
            name: opened.name,
            path: opened.path,
            content: opened.content,
            language: opened.language,
            isDirty: false,
          };
          set((state) => ({
            files: [...state.files, newFile],
            activeFileId: newFile.id,
            showProjectLauncher: false,
          }));
        }
      }
    }
  },

  loadTemplate: (templateId: string) => {
    const tmpl = CODE_TEMPLATES.find((t) => t.id === templateId);
    if (!tmpl) return;
    const newFileId = get().addNewFile(tmpl.fileName, tmpl.language, tmpl.code);
    set({ activeFileId: newFileId });
  },

  // Diagnostics
  diagnostics: [],
  setDiagnostics: (diagnostics) => set({ diagnostics }),
  clearDiagnostics: () => set({ diagnostics: [] }),

  // Compiler Configuration
  compilerConfig: {
    compilerType: 'auto',
    standard: 'c++17',
    optimization: '-O0',
    warnings: ['-Wall', '-Wextra'],
    customFlags: '',
    autoLintOnSave: true,
    autoLintDebounceMs: 700,
  },
  setCompilerConfig: (config) =>
    set((state) => ({
      compilerConfig: { ...state.compilerConfig, ...config },
    })),
  toolchains: [],
  setToolchains: (toolchains) => set({ toolchains }),

  // Lifecycle
  isCompiling: false,
  isRunning: false,
  lastBuildResult: null,
  lastBinaryPath: null,
  activePid: null,
  assemblyCode: null,

  setIsCompiling: (isCompiling) => set({ isCompiling }),
  setIsRunning: (isRunning) => set({ isRunning }),
  setLastBuildResult: (lastBuildResult) => set({ lastBuildResult }),
  setLastBinaryPath: (lastBinaryPath) => set({ lastBinaryPath }),
  setActivePid: (activePid) => set({ activePid }),
  setAssemblyCode: (assemblyCode) => set({ assemblyCode }),

  // Logs
  buildLogs: [
    'Turbo++ Compiler Log Initialized.',
    'System: Strict Learning Mode Enabled (IntelliSense suggestions disabled).',
    'Press F5 or click "Compile & Run" to execute program.',
  ],
  addBuildLog: (log) =>
    set((state) => ({ buildLogs: [...state.buildLogs, log] })),
  clearBuildLogs: () => set({ buildLogs: [] }),

  // UI
  activeBottomTab: 'terminal',
  setActiveBottomTab: (activeBottomTab) => set({ activeBottomTab }),
  theme: 'ocal-signature', // Default to Ocal Web Project Signature Theme
  setTheme: (theme) => set({ theme }),
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  sidebarTab: 'explorer',
  setSidebarTab: (sidebarTab) => set({ sidebarTab, sidebarOpen: true }),
  sidebarWidth: 280,
  setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),
  bottomPanelHeight: 280,
  setBottomPanelHeight: (bottomPanelHeight) => set({ bottomPanelHeight }),
  showShortcutsModal: false,
  setShowShortcutsModal: (showShortcutsModal) => set({ showShortcutsModal }),
  showSettingsModal: false,
  setShowSettingsModal: (showSettingsModal) => set({ showSettingsModal }),
  showAboutModal: false,
  setShowAboutModal: (showAboutModal) => set({ showAboutModal }),

  cursorPos: { line: 1, column: 1 },
  setCursorPos: (cursorPos) => set({ cursorPos }),
}));
