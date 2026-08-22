import React from 'react';
import { useIDEStore } from '../../store/ideStore';
import { Trash2, Copy, Check } from 'lucide-react';

export const BuildOutputLog: React.FC = () => {
  const { buildLogs, clearBuildLogs, theme, isCompiling, lastBuildResult } = useIDEStore();
  const [copied, setCopied] = React.useState(false);

  const isTurboTheme = theme === 'turbo-nostalgia';

  const handleCopy = () => {
    navigator.clipboard.writeText(buildLogs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <span className="font-semibold text-[11px] text-[#cccccc]">Build Output</span>
          {isCompiling && (
            <span className="text-[#0078d4] text-[11px] font-medium">Compiling...</span>
          )}
          {lastBuildResult && !isCompiling && (
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${
                lastBuildResult.success
                  ? 'bg-[#23d18b]/10 text-[#23d18b] border border-[#23d18b]/30'
                  : 'bg-[#f14c4c]/10 text-[#f14c4c] border border-[#f14c4c]/30'
              }`}
            >
              {lastBuildResult.success
                ? `Success (${lastBuildResult.durationMs}ms)`
                : `Failed (Exit Code: ${lastBuildResult.exitCode})`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors text-[#858585] cursor-pointer"
            title="Copy Logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#23d18b]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={clearBuildLogs}
            className="p-1 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors text-[#858585] cursor-pointer"
            title="Clear Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log Output Area */}
      <div
        className={`flex-1 p-3 font-mono text-xs overflow-y-auto space-y-0.5 select-text ${
          isTurboTheme ? 'bg-[#000000] text-turbo-yellow' : 'bg-[#181818] text-[#cccccc]'
        }`}
      >
        {buildLogs.length === 0 ? (
          <div className="text-[#666666] italic text-[11px]">No build output. Press Run (F5) or Compile (Ctrl+F9).</div>
        ) : (
          buildLogs.map((log, index) => {
            const isError = log.includes('error:') || log.includes('FAILED') || log.includes('Error');
            const isWarning = log.includes('warning:') || log.includes('Warning');
            const isSuccess = log.includes('Succeeded') || log.includes('SUCCESS');

            let textColor = 'text-[#cccccc]';
            if (isTurboTheme) {
              textColor = isError ? 'text-turbo-red' : isWarning ? 'text-turbo-cyan' : isSuccess ? 'text-turbo-green' : 'text-turbo-yellow';
            } else {
              textColor = isError ? 'text-[#f14c4c]' : isWarning ? 'text-[#cca700]' : isSuccess ? 'text-[#23d18b]' : 'text-[#cccccc]';
            }

            return (
              <div key={index} className={`whitespace-pre-wrap leading-relaxed ${textColor}`}>
                {log}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
