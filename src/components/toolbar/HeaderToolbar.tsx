import React from 'react';
import { useIDEStore } from '../../store/ideStore';
import { useCompiler } from '../../hooks/useCompiler';
import {
  Play,
  Hammer,
  Square,
  FolderOpen,
  FolderPlus,
  Save,
  Plus,
  HelpCircle,
  Settings as SettingsIcon,
  Info,
  Palette,
  Terminal as TerminalIcon,
  ChevronRight,
  Code2,
  Shield,
} from 'lucide-react';
import { ThemeName, LanguageTarget } from '../../types/ide';

export const HeaderToolbar: React.FC = () => {
  const {
    files,
    activeFileId,
    updateFileContent,
    addNewFile,
    openFolderFromDisk,
    workspaceName,
    theme,
    setTheme,
    isCompiling,
    isRunning,
    saveCurrentFile,
    openFileFromDisk,
    setShowShortcutsModal,
    setShowSettingsModal,
    setShowAboutModal,
  } = useIDEStore();

  const { compileActiveFile, runLastCompiledBinary, compileAndRun, killProcess } = useCompiler();

  const isOcalTheme = theme === 'ocal-signature';
  const isTurboTheme = theme === 'turbo-nostalgia';
  const activeFile = files.find((f) => f.id === activeFileId);

  const setLanguage = (newLang: LanguageTarget) => {
    if (!activeFile || activeFile.language === newLang) return;
    const baseName = activeFile.name.replace(/\.[^/.]+$/, '');
    let ext = '.cpp';
    if (newLang === 'c') ext = '.c';
    else if (newLang === 'python') ext = '.py';
    else if (newLang === 'java') ext = '.java';
    else if (newLang === 'javascript') ext = '.js';
    else if (newLang === 'typescript') ext = '.ts';
    else if (newLang === 'html') ext = '.html';
    else if (newLang === 'css') ext = '.css';
    else if (newLang === 'react' || newLang === 'nextjs') ext = '.tsx';
    else if (newLang === 'json') ext = '.json';
    else if (newLang === 'markdown') ext = '.md';

    const newName = newLang === 'java' ? 'Main.java' : newLang === 'html' ? 'index.html' : `${baseName || 'source'}${ext}`;
    activeFile.language = newLang;
    activeFile.name = newName;
    updateFileContent(activeFile.id, activeFile.content);
  };

  return (
    <header
      className={`w-full h-10 px-3 flex items-center justify-between select-none shrink-0 z-30 app-drag border-b transition-colors ${
        isTurboTheme
          ? 'bg-[#00AAAA] border-[#55FFFF] text-[#000000] font-dos font-bold'
          : isOcalTheme
          ? 'bg-[#121318] border-[#252536] text-[#e8e8e8]'
          : 'bg-[#181818] border-[#2b2b2b] text-[#cccccc]'
      }`}
    >
      {/* Left: Brand Identity & Borland DOS Menu */}
      <div className="flex items-center gap-2 shrink-0">
        {isTurboTheme ? (
          <div className="flex items-center gap-3 app-no-drag text-xs text-[#000000]">
            <span className="bg-[#0000AA] text-[#55FFFF] px-1.5 py-0.5 rounded-xs font-mono font-bold shadow-xs">
              ≡
            </span>
            <span className="font-bold tracking-tight text-[#000000]">
              <span className="text-[#AA0000]">O</span>cal Code
            </span>
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-[#008888] text-[11px]">
              <span className="hover:bg-[#0000AA] hover:text-[#FFFF55] px-1.5 py-0.5 rounded-xs cursor-pointer"><span className="text-[#AA0000]">F</span>ile</span>
              <span className="hover:bg-[#0000AA] hover:text-[#FFFF55] px-1.5 py-0.5 rounded-xs cursor-pointer"><span className="text-[#AA0000]">E</span>dit</span>
              <span className="hover:bg-[#0000AA] hover:text-[#FFFF55] px-1.5 py-0.5 rounded-xs cursor-pointer"><span className="text-[#AA0000]">S</span>earch</span>
              <span onClick={() => compileAndRun()} className="hover:bg-[#0000AA] hover:text-[#FFFF55] px-1.5 py-0.5 rounded-xs cursor-pointer"><span className="text-[#AA0000]">R</span>un</span>
              <span onClick={() => compileActiveFile()} className="hover:bg-[#0000AA] hover:text-[#FFFF55] px-1.5 py-0.5 rounded-xs cursor-pointer"><span className="text-[#AA0000]">C</span>ompile</span>
              <span onClick={() => setShowSettingsModal(true)} className="hover:bg-[#0000AA] hover:text-[#FFFF55] px-1.5 py-0.5 rounded-xs cursor-pointer"><span className="text-[#AA0000]">O</span>ptions</span>
              <span onClick={() => setShowShortcutsModal(true)} className="hover:bg-[#0000AA] hover:text-[#FFFF55] px-1.5 py-0.5 rounded-xs cursor-pointer"><span className="text-[#AA0000]">H</span>elp</span>
            </div>
          </div>
        ) : (
          <>
            {/* Brand Icon & Name */}
            <div className="flex items-center gap-2 app-no-drag">
              <Code2 className={`w-4 h-4 ${isOcalTheme ? 'text-[#34d058]' : 'text-[#0078d4]'}`} />
              <span className="text-xs font-bold tracking-tight text-[#ffffff]">
                Ocal Code
              </span>
            </div>

            {/* Workspace Breadcrumbs */}
            <div className={`hidden lg:flex items-center gap-1.5 text-xs text-[#858585] pl-2 border-l ${isOcalTheme ? 'border-[#252536]' : 'border-[#2b2b2b]'}`}>
              <span>{workspaceName || 'workspace'}</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#555555]" />
              <span className="text-[#e0e0e0] font-mono font-medium truncate max-w-[150px]">
                {activeFile?.name || 'main.cpp'}
              </span>
            </div>

            {/* Quick File Operations */}
            <div className="hidden xl:flex items-center gap-1 pl-1 app-no-drag">
              <button
                type="button"
                onClick={() => addNewFile()}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  isOcalTheme
                    ? 'hover:bg-[#181920] text-[#858585] hover:text-white'
                    : 'hover:bg-[#252525] text-[#858585] hover:text-white'
                }`}
                title="New File (Ctrl+N)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => openFolderFromDisk()}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  isOcalTheme
                    ? 'hover:bg-[#181920] text-[#858585] hover:text-[#34d058]'
                    : 'hover:bg-[#252525] text-[#858585] hover:text-white'
                }`}
                title="Open Project Folder"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => openFileFromDisk()}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  isOcalTheme
                    ? 'hover:bg-[#181920] text-[#858585] hover:text-white'
                    : 'hover:bg-[#252525] text-[#858585] hover:text-white'
                }`}
                title="Open File (Ctrl+O)"
              >
                <FolderOpen className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => saveCurrentFile()}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  isOcalTheme
                    ? 'hover:bg-[#181920] text-[#858585] hover:text-white'
                    : 'hover:bg-[#252525] text-[#858585] hover:text-white'
                }`}
                title="Save File (Ctrl+S)"
              >
                <Save className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Center: Build & Run Actions */}
      <div className="flex items-center gap-2 app-no-drag">
        {/* Compile (F9 / Alt+F9) */}
        <button
          type="button"
          onClick={() => compileActiveFile()}
          disabled={isCompiling || isRunning}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            isTurboTheme
              ? 'bg-[#0000AA] hover:bg-[#000088] text-[#FFFF55] border border-[#55FFFF] font-bold shadow-xs'
              : isOcalTheme
              ? 'bg-[#181920] hover:bg-[#222430] text-[#e8e8e8] hover:text-white border border-[#252536]'
              : 'bg-[#252525] hover:bg-[#2e2e2e] text-[#cccccc] hover:text-white border border-[#333333]'
          }`}
          title="Compile source code (Alt+F9 or F9)"
        >
          <Hammer className={`w-3.5 h-3.5 ${isCompiling ? 'animate-spin' : ''}`} />
          <span>{isCompiling ? 'Compiling...' : 'Compile'}</span>
          <kbd className={`hidden sm:inline-block text-[10px] px-1 py-0.2 rounded font-mono ${isTurboTheme ? 'bg-[#000077] text-[#55FFFF]' : 'bg-[#141414] text-[#858585]'}`}>
            Alt+F9
          </kbd>
        </button>

        {/* Compile & Run (F5 / Ctrl+F9) */}
        <button
          type="button"
          onClick={() => compileAndRun()}
          disabled={isCompiling || isRunning}
          className={`flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold rounded transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            isTurboTheme
              ? 'bg-[#00AA00] hover:bg-[#008800] text-[#FFFF55] border border-[#55FFFF] font-bold shadow-xs'
              : isOcalTheme
              ? 'bg-[#34d058] hover:bg-[#2ea043] text-black font-bold shadow-xs'
              : 'bg-[#0078d4] hover:bg-[#106ebe] text-white shadow-xs'
          }`}
          title="Compile and execute in terminal (F5 or Ctrl+F9)"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isCompiling ? 'Compiling...' : isRunning ? 'Running...' : 'Run'}</span>
          <kbd className={`hidden sm:inline-block text-[10px] px-1 py-0.2 rounded font-mono ${isTurboTheme ? 'bg-[#006600] text-[#FFFF55]' : isOcalTheme ? 'bg-[#248d3c] text-black font-bold' : 'bg-[#005a9e] text-white'}`}>
            F5
          </kbd>
        </button>

        {/* Run Last Binary (Ctrl+F5) */}
        <button
          type="button"
          onClick={runLastCompiledBinary}
          disabled={isRunning || isCompiling}
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
            isTurboTheme
              ? 'bg-[#0000AA] hover:bg-[#000088] text-[#FFFFFF] border border-[#55FFFF]'
              : isRunning || isCompiling
              ? 'opacity-50 cursor-not-allowed bg-[#2a2a2a] text-[#666666]'
              : 'bg-[#252525] hover:bg-[#2e2e2e] active:bg-[#202020] text-[#cccccc] hover:text-white border border-[#333333]'
          }`}
          title="Run previously compiled binary (Ctrl+F5)"
        >
          <TerminalIcon className="w-3.5 h-3.5 text-[#858585]" />
          <span>Run Binary</span>
        </button>

        {/* Stop Running Process */}
        {isRunning && (
          <button
            type="button"
            onClick={killProcess}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-[#a4262c] hover:bg-[#b81d24] text-white transition-colors cursor-pointer animate-pulse"
            title="Terminate running process (Shift+F5)"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>Stop</span>
          </button>
        )}

        {/* Language Target Switcher */}
        <div
          className={`flex items-center rounded border px-1 ${
            isTurboTheme
              ? 'bg-[#0000AA] border-[#55FFFF]'
              : 'bg-[#202020] border-[#333333]'
          }`}
        >
          <select
            value={activeFile?.language || 'cpp'}
            onChange={(e) => setLanguage(e.target.value as LanguageTarget)}
            className={`text-xs font-semibold py-0.5 px-1 rounded bg-transparent outline-none cursor-pointer ${
              isTurboTheme
                ? 'text-[#FFFF55] bg-[#0000AA]'
                : 'text-[#e0e0e0] bg-[#202020]'
            }`}
            title="Switch Language Target & Runtime"
          >
            <option value="cpp" className="bg-[#202020] text-white">C++ (g++)</option>
            <option value="c" className="bg-[#202020] text-white">C (gcc)</option>
            <option value="python" className="bg-[#202020] text-white">Python 3</option>
            <option value="java" className="bg-[#202020] text-white">Java</option>
            <option value="html" className="bg-[#202020] text-white">HTML5 (Web Live)</option>
            <option value="css" className="bg-[#202020] text-white">CSS3 (Stylesheet)</option>
            <option value="javascript" className="bg-[#202020] text-white">JavaScript (Node)</option>
            <option value="typescript" className="bg-[#202020] text-white">TypeScript</option>
            <option value="react" className="bg-[#202020] text-white">React (TSX)</option>
            <option value="nextjs" className="bg-[#202020] text-white">Next.js</option>
            <option value="json" className="bg-[#202020] text-white">JSON</option>
            <option value="markdown" className="bg-[#202020] text-white">Markdown</option>
          </select>
        </div>
      </div>

      {/* Right: Strict Mode, Theme Selector, Help & Settings */}
      <div className="flex items-center gap-2 pr-32 lg:pr-36 app-no-drag">
        {/* Strict Mode Indicator */}
        <div
          className={`hidden md:flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border ${
            isTurboTheme
              ? 'bg-[#0000AA] border-[#55FFFF] text-[#FFFF55]'
              : isOcalTheme
              ? 'bg-[#181920] border-[#252536] text-[#34d058]'
              : 'bg-[#202020] border-[#2b2b2b] text-[#858585]'
          }`}
          title="Strict manual syntax mode enabled"
        >
          <Shield className={`w-3 h-3 ${isTurboTheme ? 'text-[#FFFF55]' : isOcalTheme ? 'text-[#34d058]' : 'text-[#23d18b]'}`} />
          <span>Strict Learning</span>
        </div>

        {/* Theme Picker */}
        <div className="flex items-center gap-1">
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as ThemeName)}
            className={`px-2 py-0.5 text-xs rounded outline-none cursor-pointer border transition-colors ${
              isTurboTheme
                ? 'bg-[#0000AA] border-[#55FFFF] text-[#FFFF55] font-bold'
                : isOcalTheme
                ? 'bg-[#181920] border-[#252536] text-[#e8e8e8] hover:border-[#34d058]'
                : 'bg-[#252525] border-[#333333] text-[#cccccc] hover:border-[#444444]'
            }`}
          >
            <option value="ocal-signature" className="bg-[#121318] text-white">Ocal Signature</option>
            <option value="modern-dark" className="bg-[#202020] text-white">Dark+ (WinUI)</option>
            <option value="turbo-nostalgia" className="bg-[#0000AA] text-yellow-300">Turbo C++ DOS</option>
            <option value="cyberpunk-neon" className="bg-[#0d0221] text-pink-300">Cyberpunk</option>
            <option value="modern-light" className="bg-white text-black">Light</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setShowShortcutsModal(true)}
          className={`p-1 rounded transition-colors cursor-pointer ${
            isTurboTheme
              ? 'text-[#000000] hover:bg-[#0000AA] hover:text-[#FFFF55]'
              : 'text-[#858585] hover:text-white hover:bg-[#2a2a2a]'
          }`}
          title="Shortcuts & Help (F1)"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => setShowSettingsModal(true)}
          className={`p-1 rounded transition-colors cursor-pointer ${
            isTurboTheme
              ? 'text-[#000000] hover:bg-[#0000AA] hover:text-[#FFFF55]'
              : 'text-[#858585] hover:text-white hover:bg-[#2a2a2a]'
          }`}
          title="Compiler Settings (Ctrl+,)"
        >
          <SettingsIcon className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => setShowAboutModal(true)}
          className={`p-1 rounded transition-colors cursor-pointer ${
            isTurboTheme
              ? 'text-[#000000] hover:bg-[#0000AA] hover:text-[#FFFF55]'
              : 'text-[#858585] hover:text-white hover:bg-[#2a2a2a]'
          }`}
          title="About Ocal++ & Check Updates"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
