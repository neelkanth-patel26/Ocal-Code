import React, { useState, useRef, useEffect } from 'react';
import { useIDEStore } from '../../store/ideStore';
import { InteractiveTerminal } from '../terminal/InteractiveTerminal';
import { BuildOutputLog } from './BuildOutputLog';
import { ProblemsList } from './ProblemsList';
import { AssemblyViewer } from './AssemblyViewer';
import { Terminal, ScrollText, AlertCircle, Cpu, ChevronUp, ChevronDown, Maximize2, Minimize2, Globe } from 'lucide-react';
import { BottomTabType } from '../../types/ide';
import { LiveServerPreview } from '../preview/LiveServerPreview';

export const BottomPanel: React.FC = () => {
  const {
    activeBottomTab,
    setActiveBottomTab,
    diagnostics,
    theme,
    bottomPanelHeight,
    setBottomPanelHeight,
  } = useIDEStore();

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

  return (
    <div
      style={{
        height: isMaximized ? '80vh' : isCollapsed ? '32px' : `${bottomPanelHeight}px`,
      }}
      className={`flex flex-col border-t relative shrink-0 transition-none z-10 ${
        isTurboTheme
          ? 'bg-[#000088] border-turbo-cyan/40 text-white'
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
        className={`flex items-center justify-between px-2 h-8 border-b select-none shrink-0 ${
          isTurboTheme
            ? 'bg-[#0000AA] border-[#55FFFF] text-[#55FFFF] font-dos'
            : isOcalTheme
            ? 'bg-[#121318] border-[#252536] text-[#858585]'
            : 'bg-[#1f1f1f] border-[#2b2b2b] text-[#858585]'
        }`}
      >
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = activeBottomTab === tab.id && !isCollapsed;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs transition-colors rounded-t cursor-pointer ${
                  isTurboTheme
                    ? isActive
                      ? 'bg-[#000077] text-[#FFFF55] font-bold border-t-2 border-[#55FFFF]'
                      : 'text-[#AAAAAA] hover:text-white hover:bg-[#000088]'
                    : isOcalTheme
                    ? isActive
                      ? 'text-white border-b-2 border-[#34d058] font-medium bg-[#181920]'
                      : 'text-[#858585] hover:text-[#e8e8e8] hover:bg-[#15161e]'
                    : isActive
                    ? 'text-white border-b-2 border-[#0078d4] font-medium bg-[#181818]'
                    : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#252525]'
                }`}
              >
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

        {/* Panel Controls (Maximize, Collapse) */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setIsMaximized(!isMaximized)}
            className={`p-1 transition-colors rounded cursor-pointer ${
              isTurboTheme ? 'text-[#55FFFF] hover:text-[#FFFF55] hover:bg-[#000088]' : 'text-[#858585] hover:text-white hover:bg-[#2a2a2a]'
            }`}
            title={isMaximized ? 'Restore Panel' : 'Maximize Panel'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1 transition-colors rounded cursor-pointer ${
              isTurboTheme ? 'text-[#55FFFF] hover:text-[#FFFF55] hover:bg-[#000088]' : 'text-[#858585] hover:text-white hover:bg-[#2a2a2a]'
            }`}
            title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
          >
            {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {!isCollapsed && (
        <div className={`flex-1 overflow-hidden relative ${isTurboTheme ? 'bg-[#000000]' : 'bg-[#181818]'}`}>
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
