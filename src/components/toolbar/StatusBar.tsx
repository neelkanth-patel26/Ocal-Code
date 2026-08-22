import React from 'react';
import { useIDEStore } from '../../store/ideStore';
import { AlertCircle, AlertTriangle, CheckCircle2, Shield, Terminal } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const {
    cursorPos,
    files,
    activeFileId,
    compilerConfig,
    toolchains,
    diagnostics,
    theme,
    setActiveBottomTab,
    setShowSettingsModal,
  } = useIDEStore();

  const isOcalTheme = theme === 'ocal-signature';
  const isTurboTheme = theme === 'turbo-nostalgia';
  const activeFile = files.find((f) => f.id === activeFileId);
  const detectedToolchain = toolchains.find((t) => t.detected) || toolchains[0];

  const errorCount = diagnostics.filter((d) => d.severity === 'error').length;
  const warningCount = diagnostics.filter((d) => d.severity === 'warning').length;

  return (
    <footer
      className={`flex items-center justify-between px-3 h-6 text-[11px] select-none border-t shrink-0 z-20 transition-colors ${
        isTurboTheme
          ? 'bg-[#00AAAA] border-[#55FFFF] text-[#000000] font-dos font-bold'
          : isOcalTheme
          ? 'bg-[#121318] border-[#252536] text-[#858585] font-sans'
          : 'bg-[#181818] border-[#2b2b2b] text-[#858585] font-sans'
      }`}
    >
      {isTurboTheme ? (
        <div className="flex items-center justify-between w-full text-[11px] text-[#000000]">
          <div className="flex items-center gap-2">
            <span className="hover:bg-[#0000AA] hover:text-[#FFFF55] px-1 rounded-xs cursor-pointer"><span className="text-[#AA0000] font-bold">F1</span> Help</span>
            <span>|</span>
            <span className="hover:bg-[#0000AA] hover:text-[#FFFF55] px-1 rounded-xs cursor-pointer"><span className="text-[#AA0000] font-bold">F2</span> Save</span>
            <span>|</span>
            <span className="hover:bg-[#0000AA] hover:text-[#FFFF55] px-1 rounded-xs cursor-pointer"><span className="text-[#AA0000] font-bold">F3</span> Open</span>
            <span>|</span>
            <span className="hover:bg-[#0000AA] hover:text-[#FFFF55] px-1 rounded-xs cursor-pointer"><span className="text-[#AA0000] font-bold">Alt-F9</span> Compile</span>
            <span>|</span>
            <span className="hover:bg-[#0000AA] hover:text-[#FFFF55] px-1 rounded-xs cursor-pointer"><span className="text-[#AA0000] font-bold">Ctrl-F9</span> Run</span>
            <span>|</span>
            <span className="hover:bg-[#0000AA] hover:text-[#FFFF55] px-1 rounded-xs cursor-pointer"><span className="text-[#AA0000] font-bold">F10</span> Menu</span>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <span>Ln {cursorPos.line}, Col {cursorPos.column}</span>
            <span>|</span>
            <span>{activeFile ? activeFile.language.toUpperCase() : 'CPP'}</span>
            <span>|</span>
            <span>{errorCount > 0 ? `${errorCount} Err` : 'No Err'}</span>
          </div>
        </div>
      ) : (
        <>
          {/* Left items */}
          <div className="flex items-center gap-3">
            {/* Problems trigger */}
            <button
              type="button"
              onClick={() => setActiveBottomTab('problems')}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
              title="Open Problems panel"
            >
              {errorCount > 0 ? (
                <span className="flex items-center gap-1 text-[#f14c4c] font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errorCount} {errorCount === 1 ? 'Error' : 'Errors'}</span>
                </span>
              ) : warningCount > 0 ? (
                <span className="flex items-center gap-1 text-[#cca700] font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{warningCount} Warnings</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[#23d18b]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>0 Problems</span>
                </span>
              )}
            </button>

            <span className="text-[#333333]">|</span>

            {/* Strict Mode Badge */}
            <div className="flex items-center gap-1 text-[11px] text-[#858585]">
              <Shield className="w-3 h-3 text-[#23d18b]" />
              <span>Strict Learning (No-Autocomplete)</span>
            </div>
          </div>

          {/* Right items */}
          <div className="flex items-center gap-3 text-[11px]">
            {/* Terminal Quick Toggle */}
            <button
              type="button"
              onClick={() => setActiveBottomTab('terminal')}
              className="flex items-center gap-1 text-[#858585] hover:text-[#cccccc] transition-colors cursor-pointer"
              title="Toggle Terminal"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Terminal</span>
            </button>

            <span className="text-[#333333]">|</span>

            {/* Cursor Position */}
            <div className="text-[#cccccc] font-mono">
              <span>Ln {cursorPos.line}, Col {cursorPos.column}</span>
            </div>

            <span className="text-[#333333]">|</span>

            {/* Encoding */}
            <div>
              <span>UTF-8</span>
            </div>

            <span className="text-[#333333]">|</span>

            {/* Language & Standard Pill (Clickable -> Settings) */}
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="hover:text-white text-[#cccccc] font-medium transition-colors font-mono cursor-pointer"
              title="Click to view toolchain settings"
            >
              <span>
                {activeFile?.language === 'cpp'
                  ? `C++ (${compilerConfig.standard})`
                  : activeFile?.language === 'c'
                  ? `C (${compilerConfig.standard})`
                  : activeFile?.language === 'typescript'
                  ? 'TypeScript'
                  : activeFile?.language === 'react'
                  ? 'React (TSX)'
                  : activeFile?.language === 'nextjs'
                  ? 'Next.js'
                  : activeFile?.language === 'javascript'
                  ? 'JavaScript'
                  : activeFile?.language === 'python'
                  ? 'Python 3'
                  : activeFile?.language === 'java'
                  ? 'Java'
                  : activeFile?.language === 'html'
                  ? 'HTML5'
                  : activeFile?.language === 'css'
                  ? 'CSS3'
                  : activeFile?.language === 'json'
                  ? 'JSON'
                  : activeFile?.language === 'markdown'
                  ? 'Markdown'
                  : 'CPP'}
              </span>
            </button>

            <span className="text-[#333333]">|</span>

            {/* Toolchain Status */}
            <div className="text-[#858585]">
              <span>{detectedToolchain ? `${detectedToolchain.name}` : 'Ready'}</span>
            </div>
          </div>
        </>
      )}
    </footer>
  );
};
