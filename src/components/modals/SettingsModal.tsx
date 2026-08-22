import React from 'react';
import { useIDEStore } from '../../store/ideStore';
import { X, Cpu, Sliders, ShieldCheck } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    showSettingsModal,
    setShowSettingsModal,
    compilerConfig,
    setCompilerConfig,
    toolchains,
    theme,
  } = useIDEStore();

  if (!showSettingsModal) return null;

  const isTurboTheme = theme === 'turbo-nostalgia';

  const availableWarnings = [
    { flag: '-Wall', desc: 'All standard compiler warnings' },
    { flag: '-Wextra', desc: 'Extra warning checks' },
    { flag: '-Wpedantic', desc: 'Strict ISO C/C++ compliance' },
    { flag: '-Wshadow', desc: 'Warn if local variable shadows another' },
    { flag: '-Wconversion', desc: 'Warn for implicit type conversions' },
  ];

  const handleToggleWarning = (flag: string) => {
    const current = compilerConfig.warnings;
    const next = current.includes(flag)
      ? current.filter((w) => w !== flag)
      : [...current, flag];
    setCompilerConfig({ warnings: next });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        className={`w-full max-w-xl rounded shadow-popup overflow-hidden border ${
          isTurboTheme
            ? 'bg-[#0000AA] border-turbo-yellow text-white font-dos'
            : 'bg-[#202020] border-[#383838] text-[#cccccc] font-sans'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-4 py-2.5 border-b ${
            isTurboTheme
              ? 'bg-[#000077] border-turbo-yellow text-turbo-yellow'
              : 'bg-[#1f1f1f] border-[#2b2b2b] text-[#ffffff]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#0078d4]" />
            <h2 className="font-semibold text-xs tracking-tight">
              Compiler Configuration
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowSettingsModal(false)}
            className="p-1 hover:text-white rounded hover:bg-[#2e2e2e] transition-colors text-[#858585] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Toolchain Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-[#858585]">
              <Cpu className="w-3.5 h-3.5 text-[#0078d4]" />
              <span>Toolchain & Standard</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#858585] mb-1 text-[11px]">Toolchain:</label>
                <select
                  value={compilerConfig.compilerType}
                  onChange={(e) => setCompilerConfig({ compilerType: e.target.value as any })}
                  className="w-full px-2.5 py-1 rounded bg-[#181818] border border-[#333333] text-[#cccccc] outline-none focus:border-[#0078d4]"
                >
                  <option value="auto">Auto-detect (Recommended: g++)</option>
                  <option value="g++">g++ (GNU C++)</option>
                  <option value="gcc">gcc (GNU C)</option>
                  <option value="clang++">clang++ (LLVM C++)</option>
                  <option value="clang">clang (LLVM C)</option>
                  <option value="custom">Custom Path</option>
                </select>
              </div>

              <div>
                <label className="block text-[#858585] mb-1 text-[11px]">C/C++ Standard:</label>
                <select
                  value={compilerConfig.standard}
                  onChange={(e) => setCompilerConfig({ standard: e.target.value as any })}
                  className="w-full px-2.5 py-1 rounded bg-[#181818] border border-[#333333] text-[#cccccc] outline-none focus:border-[#0078d4]"
                >
                  <option value="c++11">C++11 (-std=c++11)</option>
                  <option value="c++14">C++14 (-std=c++14)</option>
                  <option value="c++17">C++17 (-std=c++17)</option>
                  <option value="c++20">C++20 (-std=c++20)</option>
                  <option value="c++23">C++23 (-std=c++23)</option>
                  <option value="c99">C99 (-std=c99)</option>
                  <option value="c11">C11 (-std=c11)</option>
                  <option value="c17">C17 (-std=c17)</option>
                </select>
              </div>
            </div>

            {compilerConfig.compilerType === 'custom' && (
              <div className="pt-1">
                <label className="block text-[#858585] mb-1 text-[11px]">Custom Executable Path:</label>
                <input
                  type="text"
                  value={compilerConfig.customCompilerPath || ''}
                  onChange={(e) => setCompilerConfig({ customCompilerPath: e.target.value })}
                  placeholder="C:\msys64\ucrt64\bin\g++.exe"
                  className="w-full px-2.5 py-1 rounded bg-[#181818] border border-[#333333] text-[#cccccc] text-xs outline-none focus:border-[#0078d4] font-mono"
                />
              </div>
            )}

            {/* Detected System Compilers */}
            <div className="p-2.5 rounded bg-[#181818] border border-[#2b2b2b] text-[11px] space-y-1">
              <span className="font-medium text-[#858585]">Detected Toolchains:</span>
              {toolchains.map((t) => (
                <div key={t.name} className="flex items-center justify-between text-[#cccccc]">
                  <span className="font-mono">{t.name}</span>
                  <span className={t.detected ? 'text-[#23d18b]' : 'text-[#666666]'}>
                    {t.detected ? t.version : 'Not found in PATH'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Optimization & Custom Flags */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-[#858585]">
              <Sliders className="w-3.5 h-3.5 text-[#0078d4]" />
              <span>Optimization & Flags</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#858585] mb-1 text-[11px]">Optimization Level:</label>
                <select
                  value={compilerConfig.optimization}
                  onChange={(e) => setCompilerConfig({ optimization: e.target.value as any })}
                  className="w-full px-2.5 py-1 rounded bg-[#181818] border border-[#333333] text-[#cccccc] outline-none focus:border-[#0078d4]"
                >
                  <option value="-O0">-O0 (No optimization, fast debug)</option>
                  <option value="-O1">-O1 (Basic optimization)</option>
                  <option value="-O2">-O2 (Release optimization)</option>
                  <option value="-O3">-O3 (Max optimization)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#858585] mb-1 text-[11px]">Custom GCC/Clang Flags:</label>
                <input
                  type="text"
                  value={compilerConfig.customFlags}
                  onChange={(e) => setCompilerConfig({ customFlags: e.target.value })}
                  placeholder="-pthread -lm"
                  className="w-full px-2.5 py-1 rounded bg-[#181818] border border-[#333333] text-[#cccccc] text-xs outline-none focus:border-[#0078d4] font-mono"
                />
              </div>
            </div>
          </div>

          {/* Warnings Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-[#858585]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0078d4]" />
              <span>Diagnostics & Warnings</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
              {availableWarnings.map((w) => {
                const isChecked = compilerConfig.warnings.includes(w.flag);
                return (
                  <label
                    key={w.flag}
                    className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-[#1e2630] border-[#294360] text-white'
                        : 'bg-[#181818] border-[#2b2b2b] text-[#858585] hover:bg-[#202020]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleWarning(w.flag)}
                      className="rounded accent-[#0078d4]"
                    />
                    <div>
                      <span className="font-semibold font-mono text-[#60cdff] mr-2">{w.flag}</span>
                      <span className="text-[#858585] text-[11px]">{w.desc}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-4 py-2.5 border-t flex justify-end ${
            isTurboTheme ? 'bg-[#000077] border-turbo-cyan/30' : 'bg-[#1f1f1f] border-[#2b2b2b]'
          }`}
        >
          <button
            type="button"
            onClick={() => setShowSettingsModal(false)}
            className="win-btn win-btn-accent px-4 py-1"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
