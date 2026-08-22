import React, { useState, useRef, useEffect } from 'react';
import { useIDEStore } from '../../store/ideStore';
import { InteractiveTerminal } from '../terminal/InteractiveTerminal';
import { BuildOutputLog } from './BuildOutputLog';
import { ProblemsList } from './ProblemsList';
import { AssemblyViewer } from './AssemblyViewer';
import {
  Terminal,
  ScrollText,
  AlertCircle,
  Cpu,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  Globe,
  RotateCw,
  Trash2,
  Square,
} from 'lucide-react';
import { BottomTabType } from '../../types/ide';
import { LiveServerPreview } from '../preview/LiveServerPreview';
import { useCompiler } from '../../hooks/useCompiler';

export const BottomPanel: React.FC = () => {
  const {
    activeBottomTab,
    setActiveBottomTab,
    diagnostics,
    theme,
    bottomPanelHeight,
    setBottomPanelHeight,
    workspacePath,
    isRunning,
  } = useIDEStore();

  const { killProcess } = useCompiler();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const isResizingRef = useRef(false);

  const isOcalTheme = theme === 'ocal-signature';
  const isTurboTheme = theme === 'turbo-nostalgia';
  const errorCount = diagnostics.filter((d) => d.severity === 'error').length;
  const warningCount = diagnostics.filter((d) => d.severity === 'warning').length;
  const totalDiags = errorCount + warningCount;

  // Drag-to-resize panel height
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizingRef.current) return;
    const newHeight = Math.max(120, Math.min(window.innerHeight - e.clientY, window.innerHeight - 150));
    setBottomPanelHeight(newHeight);
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

  const tabs: { id: BottomTabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'terminal', label: 'Terminal', icon: <Terminal className="w-3.5 h-3.5" /> },
    { id: 'live-server', label: 'Live Server Preview', icon: <Globe className="w-3.5 h-3.5 text-[#38bdf8]" /> },
    { id: 'build-output', label: 'Build Output', icon: <ScrollText className="w-3.5 h-3.5" /> },
    {
      id: 'problems',
      label: 'Problems',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      badge: totalDiags > 0 ? totalDiags : undefined,
    },
    { id: 'assembly', label: 'Assembly (g++ -S)', icon: <Cpu className="w-3.5 h-3.5" /> },
  ];

  const handleTabClick = (tabId: BottomTabType) => {
    setActiveBottomTab(tabId);
    if (isCollapsed) setIsCollapsed(false);
  };

  const runQuickCommand = (cmd: string) => {
    if (window.electronAPI) {
      window.electronAPI.sendTerminalInput(`${cmd}\r`);
    }
  };

  const handleRestartShell = () => {
    if (window.electronAPI) {
      window.electronAPI.restartTerminalSession(workspacePath || undefined);
    }
  };

  const handleClearTerminal = () => {
    if (window.electronAPI) {
      window.electronAPI.writeTerminal('\x1b[2J\x1b[H');
      window.electronAPI.sendTerminalInput('\f');
    }
  };

  return (
    <div
      style={{
        height: isMaximized ? '85vh' : isCollapsed ? '32px' : `${bottomPanelHeight}px`,
      }}
      className={`flex flex-col border-t relative shrink-0 transition-none z-10 ${
        isTurboTheme
          ? 'bg-[#000088] border-[#55FFFF] text-white'
          : isOcalTheme
          ? 'bg-[#0c0c0c] border-[#252536] text-[#e8e8e8]'
          : 'bg-[#181818] border-[#2b2b2b] text-[#cccccc]'
      }`}
    >
      {/* Top Drag Handle for resizing */}
      {!isMaximized && !isCollapsed && (
        <div
          onMouseDown={handleMouseDown}
          className="absolute -top-1 left-0 right-0 h-2 cursor-row-resize hover:bg-[#34d058] transition-colors z-20"
          title="Drag to resize panel"
        />
      )}

      {/* Header Tabs Strip */}
      <div
        className={`flex items-center justify-between px-2.5 h-8 border-b select-none shrink-0 ${
          isTurboTheme
            ? 'bg-[#0000AA] border-[#55FFFF] text-[#55FFFF] font-dos'
            : isOcalTheme
            ? 'bg-[#121318] border-[#252536] text-[#858585]'
            : 'bg-[#1f1f1f] border-[#2b2b2b] text-[#858585]'
        }`}
      >
        {/* Left Tabs */}
        <div className="flex items-center gap-1 h-full">
          {tabs.map((tab) => {
            const isActive = activeBottomTab === tab.id && !isCollapsed;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-1.5 px-3 h-full text-xs transition-colors cursor-pointer relative ${
                  isTurboTheme
                    ? isActive
                      ? 'bg-[#000077] text-[#FFFF55] font-bold border-t-2 border-[#55FFFF]'
                      : 'text-[#AAAAAA] hover:text-white hover:bg-[#000088]'
                    : isOcalTheme
                    ? isActive
                      ? 'text-white font-medium bg-[#0c0c0c]'
                      : 'text-[#858585] hover:text-[#e8e8e8] hover:bg-[#181920]'
                    : isActive
                    ? 'text-white font-medium bg-[#181818]'
                    : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#252525]'
                }`}
              >
                {isActive && !isTurboTheme && (
                  <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                    isOcalTheme ? 'bg-[#34d058]' : 'bg-[#0078d4]'
                  }`} />
                )}
                {tab.icon}
                <span>{isTurboTheme ? `[ ${tab.label} ]` : tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                      errorCount > 0
                        ? 'bg-[#f14c4c] text-white'
                        : 'bg-[#cca700] text-black'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Controls & Quick Actions */}
        <div className="flex items-center gap-2">
          {activeBottomTab === 'terminal' && !isCollapsed && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => runQuickCommand('npm run dev')}
                className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#38bdf8]/10 text-[#38bdf8] hover:bg-[#38bdf8]/20 border border-[#38bdf8]/30 cursor-pointer transition-colors"
                title="Execute: npm run dev"
              >
                npm run dev
              </button>
              <button
                type="button"
                onClick={() => runQuickCommand('npm start')}
                className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#34d058]/10 text-[#34d058] hover:bg-[#34d058]/20 border border-[#34d058]/30 cursor-pointer transition-colors"
                title="Execute: npm start"
              >
                npm start
              </button>
              <button
                type="button"
                onClick={() => runQuickCommand('npm install')}
                className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 cursor-pointer transition-colors"
                title="Execute: npm install"
              >
                npm install
              </button>

              {isRunning && (
                <button
                  type="button"
                  onClick={killProcess}
                  className="flex items-center gap-1 px-2 py-0.5 bg-[#f14c4c] hover:bg-[#d83b3b] text-white rounded transition-colors text-[11px] font-medium cursor-pointer"
                  title="Stop process"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>Stop</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleRestartShell}
                className="p-1 hover:text-white hover:bg-[#252536] rounded transition-colors text-[#858585] cursor-pointer"
                title="Restart Terminal Session"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleClearTerminal}
                className="p-1 hover:text-white hover:bg-[#252536] rounded transition-colors text-[#858585] cursor-pointer"
                title="Clear Terminal"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-0.5 border-l border-[#252536] pl-1.5">
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className={`p-1 transition-colors rounded cursor-pointer ${
                isTurboTheme ? 'text-[#55FFFF] hover:text-[#FFFF55] hover:bg-[#000088]' : 'text-[#858585] hover:text-white hover:bg-[#252536]'
              }`}
              title={isMaximized ? 'Restore Panel' : 'Maximize Panel'}
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`p-1 transition-colors rounded cursor-pointer ${
                isTurboTheme ? 'text-[#55FFFF] hover:text-[#FFFF55] hover:bg-[#000088]' : 'text-[#858585] hover:text-white hover:bg-[#252536]'
              }`}
              title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
            >
              {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Contents */}
      {!isCollapsed && (
        <div className={`flex-1 overflow-hidden relative ${
          isTurboTheme ? 'bg-[#000000]' : isOcalTheme ? 'bg-[#0c0c0c]' : 'bg-[#181818]'
        }`}>
          {activeBottomTab === 'terminal' && <InteractiveTerminal />}
          {activeBottomTab === 'live-server' && <LiveServerPreview />}
          {activeBottomTab === 'build-output' && <BuildOutputLog />}
          {activeBottomTab === 'problems' && <ProblemsList />}
          {activeBottomTab === 'assembly' && <AssemblyViewer />}
        </div>
      )}
    </div>
  );
};
