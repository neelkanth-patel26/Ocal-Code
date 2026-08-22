import React from 'react';
import { useIDEStore } from '../../store/ideStore';
import { Plus, X, ShieldCheck } from 'lucide-react';

export const EditorTabs: React.FC = () => {
  const { files, activeFileId, setActiveFileId, closeFile, addNewFile, theme, compilerConfig } =
    useIDEStore();

  const isOcalTheme = theme === 'ocal-signature';
  const isTurboTheme = theme === 'turbo-nostalgia';
  const activeFile = files.find((f) => f.id === activeFileId);

  return (
    <div
      className={`flex items-center justify-between w-full h-8 border-b select-none shrink-0 transition-colors ${
        isTurboTheme
          ? 'bg-[#0000AA] border-[#55FFFF] text-white font-dos'
          : isOcalTheme
          ? 'bg-[#121318] border-[#252536] text-[#e8e8e8]'
          : 'bg-[#181818] border-[#2b2b2b] text-[#cccccc]'
      }`}
    >
      {/* Tab List */}
      <div className="flex items-center flex-1 overflow-x-auto h-full">
        {isTurboTheme && (
          <span className="px-2 font-mono font-bold text-[#55FFFF] select-none flex items-center">
            [■] ═
          </span>
        )}

        {files.map((file, idx) => {
          const isActive = file.id === activeFileId;
          const isCpp = file.language === 'cpp';
          return (
            <div
              key={file.id}
              onClick={() => setActiveFileId(file.id)}
              className={`group flex items-center gap-2 px-3 h-full text-xs font-mono cursor-pointer border-r transition-colors shrink-0 relative ${
                isTurboTheme
                  ? isActive
                    ? 'bg-[#0000AA] text-[#FFFF55] border-[#55FFFF] font-bold shadow-inner'
                    : 'bg-[#000077] text-[#AAAAAA] hover:bg-[#000088] hover:text-white border-[#000055]'
                  : isOcalTheme
                  ? isActive
                    ? 'bg-[#0c0c0c] text-white border-[#252536] font-medium border-t-2 border-t-[#34d058]'
                    : 'bg-[#121318] text-[#858585] hover:bg-[#181920] hover:text-[#e8e8e8] border-[#252536]'
                  : isActive
                  ? 'bg-[#1e1e1e] text-white border-[#2b2b2b] font-medium border-t-2 border-t-[#0078d4]'
                  : 'bg-[#181818] text-[#858585] hover:bg-[#1f1f1f] hover:text-[#cccccc] border-[#2b2b2b]'
              }`}
            >
              <span className={`text-[9px] font-mono font-bold px-1 rounded ${
                isTurboTheme
                  ? 'text-[#55FFFF]'
                  : file.language === 'python'
                  ? 'bg-amber-950/60 text-amber-400'
                  : file.language === 'java'
                  ? 'bg-orange-950/60 text-orange-400'
                  : file.language === 'javascript'
                  ? 'bg-yellow-950/60 text-yellow-400'
                  : file.language === 'typescript'
                  ? 'bg-sky-950/60 text-sky-400'
                  : file.language === 'react' || file.language === 'nextjs'
                  ? 'bg-cyan-950/60 text-cyan-400'
                  : file.language === 'html'
                  ? 'bg-rose-950/60 text-rose-400'
                  : file.language === 'css'
                  ? 'bg-teal-950/60 text-teal-400'
                  : file.language === 'json'
                  ? 'bg-neutral-800 text-neutral-300'
                  : file.language === 'markdown'
                  ? 'bg-slate-800 text-slate-300'
                  : file.language === 'c'
                  ? 'bg-blue-950/60 text-blue-400'
                  : 'bg-indigo-950/60 text-indigo-400'
              }`}>
                {isTurboTheme
                  ? `${idx + 1}`
                  : file.language === 'typescript'
                  ? 'TS'
                  : file.language === 'react'
                  ? 'REACT'
                  : file.language === 'nextjs'
                  ? 'NEXT'
                  : file.language === 'javascript'
                  ? 'JS'
                  : file.language === 'python'
                  ? 'PY'
                  : file.language === 'java'
                  ? 'JAVA'
                  : file.language === 'html'
                  ? 'HTML'
                  : file.language === 'css'
                  ? 'CSS'
                  : file.language === 'json'
                  ? 'JSON'
                  : file.language === 'markdown'
                  ? 'MD'
                  : file.language === 'c'
                  ? 'C'
                  : 'CPP'}
              </span>

              <span className="truncate max-w-[150px]">{file.name}</span>

              {file.isDirty && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isTurboTheme ? 'bg-[#FFFF55]' : 'bg-white'
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
                  className={`p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                    isTurboTheme ? 'text-[#55FFFF] hover:text-[#FF5555]' : 'text-[#858585] hover:text-white hover:bg-[#333333]'
                  }`}
                  title="Close tab (Ctrl+W)"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => addNewFile()}
          className={`px-2 h-full transition-colors flex items-center justify-center shrink-0 cursor-pointer ${
            isTurboTheme ? 'text-[#55FFFF] hover:text-[#FFFF55]' : 'text-[#858585] hover:text-white hover:bg-[#252525]'
          }`}
          title="New File (Ctrl+N)"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {isTurboTheme && (
          <span className="px-2 font-mono font-bold text-[#55FFFF] select-none flex-1 truncate">
            ══════════════════════════════════════════════
          </span>
        )}
      </div>

      {/* Right Tab Bar Info */}
      <div className={`hidden sm:flex items-center gap-2.5 pr-3 text-[11px] shrink-0 ${isTurboTheme ? 'font-dos text-[#55FFFF]' : 'font-sans text-[#858585]'}`}>
        <div className="flex items-center gap-1">
          <ShieldCheck className={`w-3 h-3 ${isTurboTheme ? 'text-[#FFFF55]' : 'text-[#23d18b]'}`} />
          <span>{isTurboTheme ? 'Strict Mode' : 'Strict No-Suggestions'}</span>
        </div>
        <span className={isTurboTheme ? 'text-[#55FFFF]' : 'text-[#333333]'}>|</span>
        <span className={`font-medium font-mono text-[10px] ${isTurboTheme ? 'text-[#FFFF55]' : 'text-[#cccccc]'}`}>
          {activeFile ? activeFile.language.toUpperCase() : 'CPP'} ({compilerConfig.standard})
        </span>
        {isTurboTheme && (
          <span className="font-mono text-[#55FFFF] font-bold">[▲]</span>
        )}
      </div>
    </div>
  );
};
