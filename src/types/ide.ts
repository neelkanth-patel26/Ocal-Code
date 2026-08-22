export type LanguageTarget =
  | 'cpp'
  | 'c'
  | 'python'
  | 'java'
  | 'javascript'
  | 'typescript'
  | 'react'
  | 'nextjs'
  | 'html'
  | 'css'
  | 'json'
  | 'markdown'
  | 'image';

export type ThemeName = 'ocal-signature' | 'turbo-nostalgia' | 'modern-dark' | 'modern-light' | 'cyberpunk-neon';

export interface FileItem {
  id: string;
  name: string;
  path?: string;
  content: string;
  language: LanguageTarget;
  isDirty?: boolean;
  isReadOnly?: boolean;
}

export type DiagnosticSeverity = 'error' | 'warning' | 'info';

export interface DiagnosticItem {
  id: string;
  fileId?: string;
  fileName?: string;
  line: number;
  column: number;
  message: string;
  severity: DiagnosticSeverity;
  source?: string;
}

export interface CompilerConfig {
  compilerType: 'auto' | 'g++' | 'gcc' | 'clang' | 'clang++' | 'custom';
  customCompilerPath?: string;
  standard: 'c++11' | 'c++14' | 'c++17' | 'c++20' | 'c++23' | 'c99' | 'c11' | 'c17';
  optimization: '-O0' | '-O1' | '-O2' | '-O3';
  warnings: string[]; // e.g. ['-Wall', '-Wextra', '-pedantic']
  customFlags: string;
  autoLintOnSave: boolean;
  autoLintDebounceMs: number;
  outputDir?: string;
}

export interface ToolchainInfo {
  name: string;
  path: string;
  version: string;
  detected: boolean;
  isDefault: boolean;
}

export interface BuildResult {
  success: boolean;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  outputPath?: string;
  durationMs: number;
  diagnostics: DiagnosticItem[];
}

export type BottomTabType = 'terminal' | 'build-output' | 'problems' | 'assembly' | 'live-server';

export interface FileTreeNode {
  path: string;
  name: string;
  isDirectory: boolean;
  children?: FileTreeNode[];
  size?: number;
  extension?: string;
}
