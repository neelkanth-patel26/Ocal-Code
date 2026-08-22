import React, { useState, useEffect, useRef } from 'react';
import { useIDEStore } from '../../store/ideStore';
import {
  Globe,
  RefreshCw,
  ExternalLink,
  Monitor,
  Tablet,
  Smartphone,
  CheckCircle2,
  Maximize2,
  Code2,
} from 'lucide-react';

export const LiveServerPreview: React.FC = () => {
  const { files, activeFileId, theme, workspacePath } = useIDEStore();
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [key, setKey] = useState(0);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const isTurboTheme = theme === 'turbo-nostalgia';
  const isOcalTheme = theme === 'ocal-signature';
  const isModernLight = theme === 'modern-light';
  const isCyberpunk = theme === 'cyberpunk-neon';

  // Sync workspace files and workspace folder to live server backend whenever files or workspace change
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.updateLiveServerFiles(
        files.map((f) => ({
          name: f.name,
          content: f.content,
          language: f.language,
        })),
        workspacePath || undefined
      );
    }
  }, [files, workspacePath]);

  // Ensure live server is running and check status
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getLiveServerStatus().then((status) => {
        setServerOnline(status.running);
      });
    }
  }, []);

  const handleManualReload = () => {
    setKey((prev) => prev + 1);
  };

  const handleOpenExternal = async () => {
    const url = 'http://localhost:5500';
    if (window.electronAPI) {
      await window.electronAPI.openExternalUrl(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText('http://localhost:5500');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 1500);
  };

  let containerWidth = '100%';
  if (deviceMode === 'tablet') containerWidth = '768px';
  else if (deviceMode === 'mobile') containerWidth = '375px';

  return (
    <div
      className={`flex flex-col h-full w-full overflow-hidden select-none transition-colors ${
        isTurboTheme
          ? 'bg-[#000077] text-white font-dos'
          : isOcalTheme
          ? 'bg-[#0c0c0c] text-[#e8e8e8]'
          : isModernLight
          ? 'bg-[#ffffff] text-[#333333]'
          : isCyberpunk
          ? 'bg-[#0d0221] text-[#f0e6ff]'
          : 'bg-[#181818] text-[#cccccc]'
      }`}
    >
      {/* Live Server Control Bar */}
      <div
        className={`flex items-center justify-between px-3 py-1.5 border-b text-xs shrink-0 transition-colors ${
          isTurboTheme
            ? 'bg-[#0000AA] border-[#55FFFF] text-[#55FFFF]'
            : isOcalTheme
            ? 'bg-[#121318] border-[#252536] text-[#e8e8e8]'
            : isModernLight
            ? 'bg-[#f3f3f3] border-[#d4d4d4] text-[#333333]'
            : isCyberpunk
            ? 'bg-[#150536] border-[#ff007f] text-[#00f0ff]'
            : 'bg-[#1f1f1f] border-[#2b2b2b] text-[#cccccc]'
        }`}
      >
        {/* Left: Server Status & URL */}
        <div className="flex items-center gap-2.5">
          <span className={`flex items-center gap-1.5 text-[11px] font-semibold ${
            isOcalTheme ? 'text-[#34d058]' : isCyberpunk ? 'text-[#00f0ff]' : 'text-[#23d18b]'
          }`}>
            <span className={`w-2 h-2 rounded-full inline-block animate-pulse ${
              isOcalTheme ? 'bg-[#34d058]' : isCyberpunk ? 'bg-[#00f0ff]' : 'bg-[#23d18b]'
            }`} />
            Live Server Active (Port 5500)
          </span>

          <div
            onClick={handleCopyUrl}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded font-mono text-[11px] cursor-pointer border transition-colors ${
              isTurboTheme
                ? 'bg-[#000055] border-[#55FFFF] text-[#FFFF55]'
                : isOcalTheme
                ? 'bg-[#181920] border-[#252536] text-[#38bdf8] hover:border-[#34d058]'
                : isModernLight
                ? 'bg-[#ffffff] border-[#d4d4d4] text-[#0066b8]'
                : isCyberpunk
                ? 'bg-[#240a59] border-[#ff007f] text-[#ff007f]'
                : 'bg-[#141414] border-[#333333] text-[#858585] hover:text-[#cccccc]'
            }`}
            title="Click to copy live server URL"
          >
            <Globe className="w-3 h-3 text-[#38bdf8]" />
            <span>http://localhost:5500</span>
            {copiedUrl && <span className="text-[10px] text-[#34d058] ml-1">Copied!</span>}
          </div>
        </div>

        {/* Center: Device Viewport Switcher */}
        <div
          className={`flex items-center rounded border p-0.5 ${
            isTurboTheme
              ? 'bg-[#000055] border-[#55FFFF]'
              : isOcalTheme
              ? 'bg-[#181920] border-[#252536]'
              : isModernLight
              ? 'bg-[#ffffff] border-[#d4d4d4]'
              : isCyberpunk
              ? 'bg-[#240a59] border-[#ff007f]'
              : 'bg-[#181818] border-[#2e2e2e]'
          }`}
        >
          <button
            type="button"
            onClick={() => setDeviceMode('desktop')}
            className={`p-1 rounded cursor-pointer transition-colors ${
              deviceMode === 'desktop'
                ? isTurboTheme
                  ? 'bg-[#0000AA] text-[#FFFF55]'
                  : isOcalTheme
                  ? 'bg-[#34d058] text-black font-bold'
                  : 'bg-[#2a2a2a] text-white'
                : 'text-[#858585] hover:text-white'
            }`}
            title="Desktop View (100%)"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('tablet')}
            className={`p-1 rounded cursor-pointer transition-colors ${
              deviceMode === 'tablet'
                ? isTurboTheme
                  ? 'bg-[#0000AA] text-[#FFFF55]'
                  : isOcalTheme
                  ? 'bg-[#34d058] text-black font-bold'
                  : 'bg-[#2a2a2a] text-white'
                : 'text-[#858585] hover:text-white'
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeviceMode('mobile')}
            className={`p-1 rounded cursor-pointer transition-colors ${
              deviceMode === 'mobile'
                ? isTurboTheme
                  ? 'bg-[#0000AA] text-[#FFFF55]'
                  : isOcalTheme
                  ? 'bg-[#34d058] text-black font-bold'
                  : 'bg-[#2a2a2a] text-white'
                : 'text-[#858585] hover:text-white'
            }`}
            title="Mobile View (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleManualReload}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors text-xs cursor-pointer ${
              isTurboTheme
                ? 'bg-[#000055] hover:bg-[#000088] text-[#FFFF55] border border-[#55FFFF]'
                : isOcalTheme
                ? 'bg-[#181920] hover:bg-[#252536] text-[#e8e8e8] border border-[#252536]'
                : 'bg-[#252525] hover:bg-[#2e2e2e] text-[#cccccc] hover:text-white border border-[#333333]'
            }`}
            title="Reload Preview Frame"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reload</span>
          </button>

          <button
            type="button"
            onClick={handleOpenExternal}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors text-xs font-semibold cursor-pointer shadow-xs ${
              isTurboTheme
                ? 'bg-[#0000AA] hover:bg-[#000088] text-[#FFFF55] border border-[#55FFFF]'
                : isOcalTheme
                ? 'bg-[#34d058] hover:bg-[#2ea043] text-black font-bold'
                : 'bg-[#0078d4] hover:bg-[#106ebe] text-white'
            }`}
            title="Open Live Server in Default Web Browser (Opera / Chrome / Edge)"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in Browser</span>
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className={`flex-1 w-full overflow-auto flex items-center justify-center p-2 ${
        isOcalTheme ? 'bg-[#08080a]' : 'bg-[#0a0a0a]'
      }`}>
        <div
          style={{ width: containerWidth, maxWidth: '100%', height: '100%' }}
          className={`bg-white rounded-md shadow-2xl overflow-hidden border transition-all duration-200 ${
            isOcalTheme ? 'border-[#252536]' : 'border-[#333333]'
          }`}
        >
          <iframe
            key={key}
            ref={iframeRef}
            src="http://localhost:5500"
            title="Live Web Preview"
            className="w-full h-full border-none bg-white"
          />
        </div>
      </div>
    </div>
  );
};
