import React from 'react';
import { useIDEStore } from '../../store/ideStore';
import { useCompiler } from '../../hooks/useCompiler';
import { Cpu, RefreshCw } from 'lucide-react';

export const AssemblyViewer: React.FC = () => {
  const { assemblyCode, theme } = useIDEStore();
  const { generateAssembly } = useCompiler();

  const isTurboTheme = theme === 'turbo-nostalgia';

  return (
    <div className="flex flex-col h-full w-full bg-[#181818]">
      {/* Header Bar */}
      <div
        className={`flex items-center justify-between px-3 py-1 text-xs border-b ${
          isTurboTheme
            ? 'bg-[#000088] border-turbo-cyan/20 text-turbo-cyan font-dos'
            : 'bg-[#1f1f1f] border-[#2b2b2b] text-[#858585] font-sans'
        }`}
      >
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-[#0078d4]" />
          <span className="font-semibold text-[11px] text-[#cccccc]">Assembly Output (g++ -S -O2)</span>
        </div>

        <button
          type="button"
          onClick={generateAssembly}
          className="flex items-center gap-1 px-2 py-0.5 bg-[#252525] hover:bg-[#2e2e2e] text-[#cccccc] hover:text-white rounded border border-[#333333] transition-colors text-[11px] font-medium cursor-pointer"
          title="Re-generate Assembly"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Generate</span>
        </button>
      </div>

      {/* Assembly Code View */}
      <div
        className={`flex-1 p-3 font-mono text-xs overflow-y-auto select-text ${
          isTurboTheme ? 'bg-[#000000] text-turbo-cyan' : 'bg-[#181818] text-[#cccccc]'
        }`}
      >
        {assemblyCode ? (
          <pre className="whitespace-pre-wrap font-mono leading-relaxed">{assemblyCode}</pre>
        ) : (
          <div className="text-[#666666] italic flex flex-col items-center justify-center h-full gap-2 py-8">
            <span className="text-[11px]">No assembly generated.</span>
            <button
              type="button"
              onClick={generateAssembly}
              className="win-btn win-btn-accent text-xs"
            >
              Generate Assembly (g++ -S)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
