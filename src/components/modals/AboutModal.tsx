import React, { useState, useEffect } from 'react';
import { useIDEStore } from '../../store/ideStore';
import {
  X,
  Code2,
  Building2,
  User,
  Target,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Download,
  Play,
  FileText,
  Shield,
  ExternalLink,
  Cpu,
  ShieldCheck,
  Terminal,
  Layers,
} from 'lucide-react';

export const AboutModal: React.FC = () => {
  const { showAboutModal, setShowAboutModal, theme } = useIDEStore();
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ percent: number; loaded: string; total: string } | null>(null);
  const [downloadedInstallerPath, setDownloadedInstallerPath] = useState<string | null>(null);
  const [updateInfo, setUpdateInfo] = useState<{
    updateAvailable: boolean;
    currentVersion: string;
    latestVersion?: string;
    notes?: string;
    url?: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!window.electronAPI?.onUpdateDownloadProgress) return;
    const unsub = window.electronAPI.onUpdateDownloadProgress((progress) => {
      setDownloadProgress(progress);
    });
    return unsub;
  }, []);

  if (!showAboutModal) return null;

  const isTurboTheme = theme === 'turbo-nostalgia';
  const isOcalTheme = theme === 'ocal-signature';

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    setErrorMsg(null);
    setUpdateInfo(null);
    setDownloadedInstallerPath(null);

    try {
      if (window.electronAPI?.checkForUpdates) {
        const result = await window.electronAPI.checkForUpdates();
        setUpdateInfo(result);
      } else {
        // Fallback demo state
        setTimeout(() => {
          setUpdateInfo({
            updateAvailable: false,
            currentVersion: '1.0.0',
          });
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to connect to GitHub update server.');
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleDownloadUpdate = async () => {
    if (!window.electronAPI?.downloadUpdate) return;
    setDownloading(true);
    setErrorMsg(null);
    try {
      const installerPath = await window.electronAPI.downloadUpdate();
      setDownloadedInstallerPath(installerPath);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to download update.');
    } finally {
      setDownloading(false);
    }
  };

  const handleApplyUpdate = () => {
    if (downloadedInstallerPath && window.electronAPI?.applyUpdate) {
      window.electronAPI.applyUpdate(downloadedInstallerPath);
    }
  };

  const handleOpenExternal = (url: string) => {
    if (window.electronAPI) {
      window.electronAPI.openExternalUrl(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border transition-all ${
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
              {isTurboTheme ? '■ About Ocal Code' : 'About Ocal Code Studio'}
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
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Hero Branding Section */}
          <div
            className={`p-4 rounded-lg border flex items-center gap-4 ${
              isTurboTheme ? 'bg-[#000077] border-[#55FFFF]' : 'bg-[#181920] border-[#252536]'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border ${
                isTurboTheme
                  ? 'bg-[#0000AA] border-[#55FFFF]'
                  : 'bg-[#0078d4]/15 border-[#0078d4]/40'
              }`}
            >
              <Code2 className={`w-6 h-6 ${isTurboTheme ? 'text-[#FFFF55]' : 'text-[#60cdff]'}`} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-bold text-white tracking-tight">Ocal Code</h1>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
                    isTurboTheme
                      ? 'bg-[#0000AA] border-[#55FFFF] text-[#FFFF55]'
                      : 'bg-[#0078d4]/20 border-[#0078d4]/40 text-[#60cdff]'
                  }`}
                >
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
            <div
              className={`p-3 rounded-lg border flex items-center gap-3 ${
                isTurboTheme ? 'bg-[#000077] border-[#55FFFF]' : 'bg-[#181920] border-[#252536]'
              }`}
            >
              <div
                className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                  isTurboTheme ? 'bg-[#0000AA] text-[#55FFFF]' : 'bg-[#252536] text-[#0078d4]'
                }`}
              >
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-semibold text-[#858585]">Company</div>
                <div className="text-xs font-semibold text-white truncate">Gaming Network Studio</div>
              </div>
            </div>

            <div
              className={`p-3 rounded-lg border flex items-center gap-3 ${
                isTurboTheme ? 'bg-[#000077] border-[#55FFFF]' : 'bg-[#181920] border-[#252536]'
              }`}
            >
              <div
                className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                  isTurboTheme ? 'bg-[#0000AA] text-[#55FFFF]' : 'bg-[#252536] text-[#34d058]'
                }`}
              >
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-semibold text-[#858585]">Author</div>
                <div className="text-xs font-semibold text-white truncate">Neelkanth Patel</div>
              </div>
            </div>
          </div>

          {/* Aim & Mission */}
          <div
            className={`p-3.5 rounded-lg border space-y-3 ${
              isTurboTheme ? 'bg-[#000077] border-[#55FFFF]' : 'bg-[#181920] border-[#252536]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Target className={`w-4 h-4 ${isTurboTheme ? 'text-[#FFFF55]' : 'text-[#cca700]'}`} />
              <span className="text-xs font-semibold uppercase tracking-wider text-white">Our Mission</span>
            </div>

            <p className="text-xs leading-relaxed text-[#cccccc]">
              <strong>Ocal Code</strong> provides a lightning-fast developer studio supporting C, C++, Python, Java, JavaScript, TypeScript, React, HTML/CSS, with an interactive terminal and user-controlled live web server.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#252536] text-[11px]">
              <div className="flex items-center gap-1.5 text-[#858585]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#34d058]" />
                <span className="text-[#cccccc]">Local-First Security</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#858585]">
                <Cpu className="w-3.5 h-3.5 text-[#60cdff]" />
                <span className="text-[#cccccc]">Fast Parallel Toolchains</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#858585]">
                <Terminal className="w-3.5 h-3.5 text-[#cca700]" />
                <span className="text-[#cccccc]">ConPTY Real Terminal</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#858585]">
                <Layers className="w-3.5 h-3.5 text-[#c586c0]" />
                <span className="text-[#cccccc]">Inno Setup Automation</span>
              </div>
            </div>
          </div>

          {/* GitHub Auto-Update Section (Ocal Browser Pattern) */}
          <div
            className={`p-3.5 rounded-lg border space-y-3 ${
              isTurboTheme ? 'bg-[#000077] border-[#55FFFF]' : 'bg-[#181920] border-[#252536]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className={`w-3.5 h-3.5 ${isTurboTheme ? 'text-[#55FFFF]' : 'text-[#0078d4]'}`} />
                <span className="text-xs font-semibold uppercase tracking-wider text-white">GitHub Updates</span>
              </div>
              <span className="text-[10px] text-[#34d058] flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34d058] inline-block animate-pulse" />
                Release Channel
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="text-xs">
                <div className="font-medium text-white">Current Version: v1.0.0</div>
                <div className="text-[11px] text-[#858585]">Official GitHub Release Feed</div>
              </div>

              {!updateInfo?.updateAvailable && !downloadedInstallerPath && (
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
                  <span>{checkingUpdate ? 'Checking GitHub...' : 'Check for Updates'}</span>
                </button>
              )}
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-2.5 rounded bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Up to Date Banner */}
            {updateInfo && !updateInfo.updateAvailable && !errorMsg && (
              <div className="p-2.5 rounded bg-[#162319] border border-[#23532c] text-xs text-[#34d058] flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>You are on the latest version of Ocal Code (v{updateInfo.currentVersion}).</span>
              </div>
            )}

            {/* Update Available Card */}
            {updateInfo?.updateAvailable && !downloadedInstallerPath && (
              <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/60 space-y-2.5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300">
                    🚀 New Update Available: v{updateInfo.latestVersion}
                  </span>
                  {updateInfo.url && (
                    <button
                      type="button"
                      onClick={() => handleOpenExternal(updateInfo.url!)}
                      className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Notes</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {downloading ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-[#cccccc]">
                      <span>Downloading installer...</span>
                      <span>{downloadProgress ? `${downloadProgress.percent}%` : 'Starting...'}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#181920] overflow-hidden">
                      <div
                        className="h-full bg-[#34d058] transition-all duration-200"
                        style={{ width: `${downloadProgress?.percent || 0}%` }}
                      />
                    </div>
                    {downloadProgress && (
                      <div className="text-[10px] text-[#858585] text-right">
                        {downloadProgress.loaded} MB / {downloadProgress.total} MB
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleDownloadUpdate}
                    className="w-full py-2 rounded bg-[#34d058] hover:bg-[#2eb84c] text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download & Prepare Inno Update</span>
                  </button>
                )}
              </div>
            )}

            {/* Restart & Apply Update Ready */}
            {downloadedInstallerPath && (
              <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-700/60 space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update Downloaded & Ready to Install</span>
                </div>
                <button
                  type="button"
                  onClick={handleApplyUpdate}
                  className="w-full py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Restart & Install Update Now</span>
                </button>
              </div>
            )}
          </div>

          {/* Legal, Terms & Privacy Links */}
          <div className="flex items-center justify-between text-[11px] px-1 text-[#858585]">
            <button
              type="button"
              onClick={() => handleOpenExternal('https://github.com/neelkanth-patel26/Ocal-Code/blob/main/TERMS_AND_CONDITIONS.md')}
              className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <FileText className="w-3 h-3" />
              <span>Terms & Conditions</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenExternal('https://github.com/neelkanth-patel26/Ocal-Code/blob/main/PRIVACY_POLICY.md')}
              className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Shield className="w-3 h-3" />
              <span>Privacy Policy</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenExternal('https://github.com/neelkanth-patel26/Ocal-Code')}
              className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              <span>GitHub Repo</span>
            </button>
          </div>
        </div>

        {/* Footer Bar */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between text-xs ${
            isTurboTheme
              ? 'bg-[#000077] border-[#55FFFF] text-[#55FFFF]'
              : 'bg-[#181920] border-[#252536] text-[#858585]'
          }`}
        >
          <span>© 2026 Gaming Network Studio Media Group</span>
          <button
            type="button"
            onClick={() => setShowAboutModal(false)}
            className={`px-4 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              isTurboTheme
                ? 'bg-[#0000AA] border border-[#55FFFF] text-[#FFFF55] hover:bg-[#000088]'
                : 'bg-[#252536] hover:bg-[#33334d] text-white border border-[#383850]'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
