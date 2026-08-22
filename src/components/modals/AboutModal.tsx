import React, { useState } from 'react';
import { useIDEStore } from '../../store/ideStore';
import {
  X,
  Code2,
  Building2,
  User,
  Target,
  RefreshCw,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Zap,
  Terminal,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

export const AboutModal: React.FC = () => {
  const { showAboutModal, setShowAboutModal, theme, toolchains } = useIDEStore();
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  if (!showAboutModal) return null;

  const isTurboTheme = theme === 'turbo-nostalgia';
  const isOcalTheme = theme === 'ocal-signature';
  const defaultToolchain = toolchains.find((t) => t.detected) || toolchains[0];

  const handleCheckUpdate = () => {
    setCheckingUpdate(true);
    setUpdateStatus(null);
    setTimeout(() => {
      setCheckingUpdate(false);
      setUpdateStatus('You are using the latest version of Ocal Code (v1.0.0 Stable).');
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-lg shadow-2xl overflow-hidden border transition-all ${
          isTurboTheme
            ? 'bg-[#0000AA] border-[#55FFFF] text-white font-dos'
            : isOcalTheme
            ? 'bg-[#121318] border-[#252536] text-[#e8e8e8] font-sans'
            : 'bg-[#202020] border-[#333333] text-[#cccccc] font-sans'
        }`}
      >
        {/* Titlebar Header */}
        <div
          className={`flex items-center justify-between px-4 py-2.5 border-b ${
            isTurboTheme
              ? 'bg-[#000077] border-[#55FFFF] text-[#55FFFF]'
              : isOcalTheme
              ? 'bg-[#181920] border-[#252536] text-[#ffffff]'
              : 'bg-[#181818] border-[#2b2b2b] text-[#ffffff]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Code2 className={`w-4 h-4 ${isTurboTheme ? 'text-[#55FFFF]' : isOcalTheme ? 'text-[#34d058]' : 'text-[#0078d4]'}`} />
            <h2 className="font-semibold text-xs tracking-tight">
              {isTurboTheme ? '■ About Ocal Code' : 'About Ocal Code'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowAboutModal(false)}
            className={`p-1 rounded transition-colors cursor-pointer ${
              isTurboTheme
                ? 'text-[#55FFFF] hover:text-[#FF5555] hover:bg-[#0000AA]'
                : 'text-[#858585] hover:text-white hover:bg-[#2e2e2e]'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[78vh] overflow-y-auto">
          {/* Hero Branding Section */}
          <div className={`p-4 rounded-md border flex items-center gap-4 ${
            isTurboTheme
              ? 'bg-[#000077] border-[#55FFFF]'
              : 'bg-[#181818] border-[#2b2b2b]'
          }`}>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border ${
              isTurboTheme
                ? 'bg-[#0000AA] border-[#55FFFF]'
                : 'bg-[#0078d4]/15 border-[#0078d4]/40'
            }`}>
              <Code2 className={`w-6 h-6 ${isTurboTheme ? 'text-[#FFFF55]' : 'text-[#60cdff]'}`} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-bold text-white tracking-tight">Ocal Code</h1>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
                  isTurboTheme
                    ? 'bg-[#0000AA] border-[#55FFFF] text-[#FFFF55]'
                    : 'bg-[#0078d4]/20 border-[#0078d4]/40 text-[#60cdff]'
                }`}>
                  v1.0.0 Stable
                </span>
              </div>
              <p className="text-xs text-[#858585] mt-0.5 truncate">
                Modern Multi-Language & Web Developer Studio
              </p>
            </div>
          </div>

          {/* Developer & Organization Row */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className={`p-3 rounded-md border flex items-center gap-3 ${
              isTurboTheme
                ? 'bg-[#000077] border-[#55FFFF]'
                : 'bg-[#181818] border-[#2b2b2b]'
            }`}>
              <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                isTurboTheme ? 'bg-[#0000AA] text-[#55FFFF]' : 'bg-[#252525] text-[#0078d4]'
              }`}>
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-semibold text-[#858585]">Company</div>
                <div className="text-xs font-semibold text-white truncate">Gaming Network Studio</div>
              </div>
            </div>

            <div className={`p-3 rounded-md border flex items-center gap-3 ${
              isTurboTheme
                ? 'bg-[#000077] border-[#55FFFF]'
                : 'bg-[#181818] border-[#2b2b2b]'
            }`}>
              <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                isTurboTheme ? 'bg-[#0000AA] text-[#55FFFF]' : 'bg-[#252525] text-[#23d18b]'
              }`}>
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-semibold text-[#858585]">Developer</div>
                <div className="text-xs font-semibold text-white truncate">Ocal Team</div>
              </div>
            </div>
          </div>

          {/* Aim & Purpose Section */}
          <div className={`p-3.5 rounded-md border space-y-3 ${
            isTurboTheme
              ? 'bg-[#000077] border-[#55FFFF]'
              : 'bg-[#181818] border-[#2b2b2b]'
          }`}>
            <div className="flex items-center gap-2">
              <Target className={`w-4 h-4 ${isTurboTheme ? 'text-[#FFFF55]' : 'text-[#cca700]'}`} />
              <span className="text-xs font-semibold uppercase tracking-wider text-white">Our Aim & Mission</span>
            </div>

            <p className="text-xs leading-relaxed text-[#cccccc]">
              <strong>Ocal Code</strong> was engineered to provide a lightning-fast, zero-friction developer studio supporting C, C++, Python, Java, JavaScript, TypeScript, React, and HTML/CSS with an embedded live web server.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#2a2a2a] text-[11px]">
              <div className="flex items-center gap-1.5 text-[#858585]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#23d18b]" />
                <span className="text-[#cccccc]">Strict Muscle Memory</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#858585]">
                <Cpu className="w-3.5 h-3.5 text-[#60cdff]" />
                <span className="text-[#cccccc]">Turbo C++ Shims</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#858585]">
                <Terminal className="w-3.5 h-3.5 text-[#cca700]" />
                <span className="text-[#cccccc]">Interactive Terminal</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#858585]">
                <Layers className="w-3.5 h-3.5 text-[#c586c0]" />
                <span className="text-[#cccccc]">Bundled GCC Toolchain</span>
              </div>
            </div>
          </div>

          {/* Software Updates & Channel */}
          <div className={`p-3.5 rounded-md border space-y-3 ${
            isTurboTheme
              ? 'bg-[#000077] border-[#55FFFF]'
              : 'bg-[#181818] border-[#2b2b2b]'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className={`w-3.5 h-3.5 ${isTurboTheme ? 'text-[#55FFFF]' : 'text-[#0078d4]'}`} />
                <span className="text-xs font-semibold uppercase tracking-wider text-white">Software Updates</span>
              </div>
              <span className="text-[10px] text-[#23d18b] flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#23d18b] inline-block animate-pulse" />
                Latest Build
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="text-xs">
                <div className="font-medium text-white">Release Channel</div>
                <div className="text-[11px] text-[#858585]">Production Stable (Windows x64 Native)</div>
              </div>

              <button
                type="button"
                onClick={handleCheckUpdate}
                disabled={checkingUpdate}
                className={`px-3.5 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isTurboTheme
                    ? 'bg-[#0000AA] text-[#FFFF55] border border-[#55FFFF] hover:bg-[#000088]'
                    : 'bg-[#0078d4] hover:bg-[#106ebe] active:bg-[#005a9e] text-white shadow-xs'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingUpdate ? 'animate-spin' : ''}`} />
                <span>{checkingUpdate ? 'Checking...' : 'Check for Updates'}</span>
              </button>
            </div>

            {updateStatus && (
              <div className="p-2 rounded bg-[#162319] border border-[#23532c] text-xs text-[#23d18b] flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{updateStatus}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Bar */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between text-xs ${
            isTurboTheme ? 'bg-[#000077] border-[#55FFFF] text-[#55FFFF]' : 'bg-[#181818] border-[#2b2b2b] text-[#858585]'
          }`}
        >
          <span>© 2026 Gaming Network Studio. All rights reserved.</span>
          <button
            type="button"
            onClick={() => setShowAboutModal(false)}
            className={`px-4 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              isTurboTheme
                ? 'bg-[#0000AA] border border-[#55FFFF] text-[#FFFF55] hover:bg-[#000088]'
                : 'bg-[#2a2a2a] hover:bg-[#333333] text-white border border-[#383838]'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
