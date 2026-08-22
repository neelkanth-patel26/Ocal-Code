import React, { useState, useRef, useEffect } from 'react';
import { useIDEStore } from '../../store/ideStore';
import { CODE_TEMPLATES } from '../../templates/defaultSnippets';
import {
  FileCode2,
  Code,
  Plus,
  FolderOpen,
  Save,
  Search,
  Sparkles,
  Cpu,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

export const LeftSidebar: React.FC = () => {
  const {
    files,
    activeFileId,
    setActiveFileId,
    addNewFile,
    saveCurrentFile,
    openFileFromDisk,
    closeFile,
    loadTemplate,
    toolchains,
    compilerConfig,
    setCompilerConfig,
    theme,
    sidebarTab,
    sidebarWidth,
    setSidebarWidth,
    diagnostics,
    setCursorPos,
  } = useIDEStore();

  const [searchQuery, setSearchQuery] = useState('');
  const isResizingRef = useRef(false);

  const isOcalTheme = theme === 'ocal-signature';
  const isTurboTheme = theme === 'turbo-nostalgia';
  const defaultToolchain = toolchains.find((t) => t.detected) || toolchains[0];

  // Drag to resize sidebar width
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizingRef.current) return;
    const newWidth = Math.max(180, Math.min(e.clientX - 44, 450));
    setSidebarWidth(newWidth);
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const filteredTemplates = CODE_TEMPLATES.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      style={{ width: `${sidebarWidth}px` }}
      className={`h-full flex flex-col border-r select-none shrink-0 relative transition-none ${
        isTurboTheme
          ? 'bg-[#0000AA] border-[#55FFFF] text-white font-dos'
          : isOcalTheme
          ? 'bg-[#0c0c0c] border-[#252536] text-[#e8e8e8] font-sans'
          : 'bg-[#181818] border-[#2b2b2b] text-[#cccccc] font-sans'
      }`}
    >
      {/* ========================================================
          1. EXPLORER TAB
         ======================================================== */}
      {sidebarTab === 'explorer' && (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div
            className={`flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wide border-b ${
              isTurboTheme
                ? 'bg-[#000077] border-[#55FFFF] text-[#55FFFF]'
                : isOcalTheme
                ? 'bg-[#121318] border-[#252536] text-[#e8e8e8]'
                : 'bg-[#1f1f1f] border-[#2b2b2b] text-[#858585]'
            }`}
          >
            <span>{isTurboTheme ? '■ Project Files' : 'Workspace Files'}</span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => addNewFile()}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  isTurboTheme ? 'hover:bg-[#0000AA] text-[#55FFFF] hover:text-[#FFFF55]' : 'hover:text-white hover:bg-[#2e2e2e]'
                }`}
                title="New File (Ctrl+N)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => openFileFromDisk()}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  isTurboTheme ? 'hover:bg-[#0000AA] text-[#55FFFF] hover:text-[#FFFF55]' : 'hover:text-white hover:bg-[#2e2e2e]'
                }`}
                title="Open from Disk (F3)"
              >
                <FolderOpen className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => saveCurrentFile()}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  isTurboTheme ? 'hover:bg-[#0000AA] text-[#55FFFF] hover:text-[#FFFF55]' : 'hover:text-white hover:bg-[#2e2e2e]'
                }`}
                title="Save (F2)"
              >
                <Save className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* File Tree List */}
          <div className="flex-1 p-1 overflow-y-auto space-y-0.5">
            {files.map((file) => {
              const isActive = file.id === activeFileId;
              const isCpp = file.language === 'cpp';
              return (
                <div
                  key={file.id}
                  onClick={() => setActiveFileId(file.id)}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded text-xs cursor-pointer transition-colors ${
                    isTurboTheme
                      ? isActive
                        ? 'bg-[#000077] text-[#FFFF55] font-bold border border-[#55FFFF] shadow-inner'
                        : 'text-[#AAAAAA] hover:bg-[#000077]/60 hover:text-white'
                      : isActive
                      ? 'bg-[#2a2d2e] text-white font-medium border-l-2 border-[#0078d4]'
                      : 'text-[#cccccc] hover:bg-[#232323] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`text-[9px] font-mono font-bold px-1 rounded ${
                      isTurboTheme
                        ? 'bg-[#000055] text-[#55FFFF]'
                        : file.language === 'python'
                        ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                        : file.language === 'java'
                        ? 'bg-orange-950/60 text-orange-400 border border-orange-800/40'
                        : file.language === 'javascript'
                        ? 'bg-yellow-950/60 text-yellow-400 border border-yellow-800/40'
                        : file.language === 'typescript'
                        ? 'bg-sky-950/60 text-sky-400 border border-sky-800/40'
                        : file.language === 'react' || file.language === 'nextjs'
                        ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/40'
                        : file.language === 'c'
                        ? 'bg-blue-950/60 text-blue-400 border border-blue-800/40'
                        : 'bg-[#2c2c2c] text-[#858585]'
                    }`}>
                      {file.language === 'python'
                        ? 'PY'
                        : file.language === 'java'
                        ? 'JAVA'
                        : file.language === 'javascript'
                        ? 'JS'
                        : file.language === 'typescript'
                        ? 'TS'
                        : file.language === 'react'
                        ? 'REACT'
                        : file.language === 'nextjs'
                        ? 'NEXT'
                        : file.language === 'c'
                        ? 'C'
                        : 'CPP'}
                    </span>
                    <span className="truncate font-mono text-xs">{file.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {file.isDirty && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isTurboTheme ? 'bg-[#FFFF55]' : 'bg-[#cccccc]'
                        }`}
                        title="Unsaved changes"
                      />
                    )}
                    {files.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeFile(file.id);
                        }}
                        className={`opacity-0 group-hover:opacity-100 p-0.5 transition-opacity cursor-pointer ${
                          isTurboTheme ? 'text-[#FF5555]' : 'hover:text-[#f14c4c]'
                        }`}
                        title="Close File"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Toolchain Status Footer */}
          <div
            className={`p-2.5 border-t text-[11px] ${
              isTurboTheme
                ? 'bg-[#000077] border-[#55FFFF] text-[#AAAAAA]'
                : 'bg-[#1f1f1f] border-[#2b2b2b] text-[#858585]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>Compiler:</span>
              <span className={`font-medium truncate max-w-[130px] ${isTurboTheme ? 'text-[#55FFFF]' : 'text-[#cccccc]'}`}>
                {defaultToolchain?.detected ? defaultToolchain.name : 'gcc (Ready)'}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span>Standard:</span>
              <span className={`font-medium ${isTurboTheme ? 'text-[#FFFF55]' : 'text-[#0078d4]'}`}>{compilerConfig.standard}</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. TEMPLATES TAB
         ======================================================== */}
      {sidebarTab === 'templates' && (
        <div className="flex flex-col h-full overflow-hidden">
          <div
            className={`p-2.5 border-b ${
              isTurboTheme
                ? 'bg-[#0000AA] border-turbo-cyan/30'
                : 'bg-[#1f1f1f] border-[#2b2b2b]'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold uppercase text-[#cccccc]">
              <Sparkles className="w-3.5 h-3.5 text-[#0078d4]" />
              <span>Multi-Language Code Templates</span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#858585]" />
              <input
                type="text"
                placeholder="Search templates (C++, Python, Java, React...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2.5 py-1 text-xs rounded bg-[#181818] border border-[#333333] text-[#cccccc] placeholder-[#666666] outline-none focus:border-[#0078d4]"
              />
            </div>
          </div>

          <div className="flex-1 p-1.5 overflow-y-auto space-y-1">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => loadTemplate(tmpl.id)}
                className={`p-2 rounded text-xs cursor-pointer border transition-colors ${
                  isTurboTheme
                    ? 'bg-[#000077] border-turbo-cyan/30 hover:bg-[#0000AA] hover:border-turbo-yellow'
                    : 'bg-[#202020] border-[#2b2b2b] hover:bg-[#2a2a2a] hover:border-[#383838]'
                }`}
              >
                <div className="flex items-center justify-between font-semibold text-[#ffffff] mb-1">
                  <span className="truncate">{tmpl.title}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    tmpl.language === 'python'
                      ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                      : tmpl.language === 'java'
                      ? 'bg-orange-950/60 text-orange-400 border border-orange-800/40'
                      : tmpl.language === 'javascript'
                      ? 'bg-yellow-950/60 text-yellow-400 border border-yellow-800/40'
                      : tmpl.language === 'typescript'
                      ? 'bg-sky-950/60 text-sky-400 border border-sky-800/40'
                      : tmpl.language === 'react' || tmpl.language === 'nextjs'
                      ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/40'
                      : 'bg-indigo-950/60 text-indigo-400 border border-indigo-800/40'
                  }`}>
                    {tmpl.language}
                  </span>
                </div>
                <p className="text-[11px] text-[#858585] line-clamp-2 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          3. PROBLEMS TAB
         ======================================================== */}
      {sidebarTab === 'problems' && (
        <div className="flex flex-col h-full overflow-hidden">
          <div
            className={`p-2.5 border-b text-[11px] font-semibold uppercase ${
              isTurboTheme
                ? 'bg-[#0000AA] border-turbo-cyan/30 text-turbo-cyan'
                : 'bg-[#1f1f1f] border-[#2b2b2b] text-[#858585]'
            }`}
          >
            <span>Diagnostics ({diagnostics.length})</span>
          </div>

          <div className="flex-1 p-1.5 overflow-y-auto space-y-1">
            {diagnostics.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-1.5 py-8 text-center px-4">
                <CheckCircle2 className="w-6 h-6 text-[#23d18b]" />
                <span className="text-xs font-medium text-[#cccccc]">No Problems Detected</span>
                <span className="text-[11px] text-[#666666]">Active file syntax is valid.</span>
              </div>
            ) : (
              diagnostics.map((diag) => (
                <div
                  key={diag.id}
                  onClick={() => setCursorPos({ line: diag.line, column: diag.column })}
                  className="p-2 rounded bg-[#281a1c] border border-[#5a2328] text-xs cursor-pointer hover:bg-[#341d21] transition-colors"
                >
                  <div className="flex items-start gap-1.5 text-[#f14c4c] font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{diag.message}</span>
                  </div>
                  <div className="mt-1 text-[10px] text-[#858585] flex items-center justify-between">
                    <span>{diag.fileName}</span>
                    <span>Line {diag.line}, Col {diag.column}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          4. SETTINGS TAB
         ======================================================== */}
      {sidebarTab === 'settings' && (
        <div className="flex flex-col h-full overflow-hidden">
          <div
            className={`p-2.5 border-b text-[11px] font-semibold uppercase ${
              isTurboTheme
                ? 'bg-[#0000AA] border-turbo-cyan/30 text-turbo-cyan'
                : 'bg-[#1f1f1f] border-[#2b2b2b] text-[#858585]'
            }`}
          >
            <span>Compiler Options</span>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
            <div>
              <label className="block text-[#858585] mb-1 text-[11px]">C/C++ Standard:</label>
              <select
                value={compilerConfig.standard}
                onChange={(e) => setCompilerConfig({ standard: e.target.value as any })}
                className="w-full px-2 py-1 rounded bg-[#181818] border border-[#333333] text-[#cccccc] outline-none focus:border-[#0078d4]"
              >
                <option value="c++11">C++11</option>
                <option value="c++14">C++14</option>
                <option value="c++17">C++17 (Default)</option>
                <option value="c++20">C++20</option>
                <option value="c++23">C++23</option>
                <option value="c99">C99</option>
                <option value="c11">C11</option>
                <option value="c17">C17</option>
              </select>
            </div>

            <div>
              <label className="block text-[#858585] mb-1 text-[11px]">Optimization Level:</label>
              <select
                value={compilerConfig.optimization}
                onChange={(e) => setCompilerConfig({ optimization: e.target.value as any })}
                className="w-full px-2 py-1 rounded bg-[#181818] border border-[#333333] text-[#cccccc] outline-none focus:border-[#0078d4]"
              >
                <option value="-O0">-O0 (Debug / Fast Build)</option>
                <option value="-O1">-O1 (Basic)</option>
                <option value="-O2">-O2 (Release Optimized)</option>
                <option value="-O3">-O3 (Max Optimization)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#858585] mb-1 text-[11px]">Custom Compiler Flags:</label>
              <input
                type="text"
                placeholder="-pthread -lm"
                value={compilerConfig.customFlags}
                onChange={(e) => setCompilerConfig({ customFlags: e.target.value })}
                className="w-full px-2 py-1 rounded bg-[#181818] border border-[#333333] text-[#cccccc] outline-none font-mono text-[11px] focus:border-[#0078d4]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-[#0078d4] transition-colors z-20"
        title="Drag to resize sidebar"
      />
    </aside>
  );
};
