import React from 'react';
import { useIDEStore } from '../../store/ideStore';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const ProblemsList: React.FC = () => {
  const { diagnostics, theme, files, activeFileId, setActiveFileId, setCursorPos } = useIDEStore();

  const isTurboTheme = theme === 'turbo-nostalgia';
  const errorCount = diagnostics.filter((d) => d.severity === 'error').length;
  const warningCount = diagnostics.filter((d) => d.severity === 'warning').length;

  const handleJumpToProblem = (diag: { fileName?: string; line: number; column: number }) => {
    if (diag.fileName) {
      const targetFile = files.find((f) => f.name === diag.fileName);
      if (targetFile && targetFile.id !== activeFileId) {
        setActiveFileId(targetFile.id);
      }
    }
    setCursorPos({ line: diag.line, column: diag.column });
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
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[11px] text-[#cccccc]">Diagnostics</span>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="flex items-center gap-1 text-[#f14c4c] font-medium">
              <AlertCircle className="w-3 h-3" />
              <span>{errorCount} {errorCount === 1 ? 'Error' : 'Errors'}</span>
            </span>
            <span className="flex items-center gap-1 text-[#cca700] font-medium">
              <AlertTriangle className="w-3 h-3" />
              <span>{warningCount} {warningCount === 1 ? 'Warning' : 'Warnings'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Problems List View */}
      <div
        className={`flex-1 p-2 font-mono text-xs overflow-y-auto space-y-1 select-none ${
          isTurboTheme ? 'bg-[#000000]' : 'bg-[#181818]'
        }`}
      >
        {diagnostics.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#666666] gap-1.5 py-6">
            <CheckCircle2 className="w-6 h-6 text-[#23d18b]" />
            <span className="text-xs font-medium text-[#cccccc]">No problems detected in workspace</span>
          </div>
        ) : (
          diagnostics.map((diag) => {
            const isError = diag.severity === 'error';

            return (
              <div
                key={diag.id}
                onClick={() => handleJumpToProblem(diag)}
                className={`flex items-start gap-2 p-2 rounded cursor-pointer transition-colors border ${
                  isTurboTheme
                    ? isError
                      ? 'bg-[#330000] border-turbo-red/50 hover:bg-[#550000] text-turbo-white'
                      : 'bg-[#333300] border-turbo-yellow/50 hover:bg-[#555500] text-turbo-yellow'
                    : isError
                    ? 'bg-[#281a1c] border-[#5a2328] hover:bg-[#341d21] text-[#cccccc]'
                    : 'bg-[#28251a] border-[#5a4d23] hover:bg-[#342e1d] text-[#cccccc]'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isError ? (
                    <AlertCircle className={`w-3.5 h-3.5 ${isTurboTheme ? 'text-turbo-red' : 'text-[#f14c4c]'}`} />
                  ) : (
                    <AlertTriangle className={`w-3.5 h-3.5 ${isTurboTheme ? 'text-turbo-yellow' : 'text-[#cca700]'}`} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 font-medium">
                    <span className="truncate">{diag.message}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#858585]">
                    <span className="text-[#0078d4] font-medium">{diag.fileName || 'source.cpp'}</span>
                    <span>Line {diag.line}, Col {diag.column}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
