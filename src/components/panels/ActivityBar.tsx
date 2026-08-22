import React from 'react';
import { useIDEStore } from '../../store/ideStore';
import {
  Files,
  Sparkles,
  AlertCircle,
  Cpu,
  Settings,
  HelpCircle,
  Info,
  PanelLeftClose,
  PanelLeft,
  LayoutGrid,
} from 'lucide-react';

export const ActivityBar: React.FC = () => {
  const {
    sidebarTab,
    setSidebarTab,
    sidebarOpen,
    toggleSidebar,
    diagnostics,
    theme,
    showProjectLauncher,
    setShowProjectLauncher,
    setShowSettingsModal,
    setShowShortcutsModal,
    setShowAboutModal,
  } = useIDEStore();

  const isOcalTheme = theme === 'ocal-signature';
  const isTurboTheme = theme === 'turbo-nostalgia';
  const errorCount = diagnostics.filter((d) => d.severity === 'error').length;
  const warningCount = diagnostics.filter((d) => d.severity === 'warning').length;
  const totalDiags = errorCount + warningCount;

  const handleTabClick = (tab: 'explorer' | 'templates' | 'problems' | 'settings') => {
    if (sidebarOpen && sidebarTab === tab) {
      toggleSidebar();
    } else {
      setSidebarTab(tab);
    }
  };

  const navItems: { id: 'explorer' | 'templates' | 'problems' | 'settings'; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'explorer', label: 'Explorer (Ctrl+B)', icon: <Files className="w-4 h-4" /> },
    { id: 'templates', label: 'Code Templates', icon: <Sparkles className="w-4 h-4" /> },
    {
      id: 'problems',
      label: 'Problems & Diagnostics',
      icon: <AlertCircle className="w-4 h-4" />,
      badge: totalDiags > 0 ? totalDiags : undefined,
    },
    { id: 'settings', label: 'Compiler Configuration', icon: <Cpu className="w-4 h-4" /> },
  ];

  return (
    <div
      className={`w-11 h-full flex flex-col items-center justify-between py-2 border-r select-none shrink-0 z-10 ${
        isTurboTheme
          ? 'bg-[#0000AA] border-[#55FFFF] text-[#55FFFF] font-dos'
          : isOcalTheme
          ? 'bg-[#0c0c0c] border-[#252536] text-[#858585]'
          : 'bg-[#181818] border-[#2b2b2b] text-[#858585]'
      }`}
    >
      {/* Top Nav Items */}
      <div className="flex flex-col items-center gap-1 w-full">
        {/* Project Hub / Welcome Launcher Button */}
        <button
          type="button"
          onClick={() => setShowProjectLauncher(true)}
          className={`flex items-center justify-center w-8 h-8 rounded transition-colors cursor-pointer mb-1 ${
            showProjectLauncher
              ? isTurboTheme
                ? 'bg-[#000077] text-[#FFFF55] border border-[#55FFFF]'
                : isOcalTheme
                ? 'bg-[#34d058]/20 text-[#34d058] border border-[#34d058]/40 shadow-xs'
                : 'bg-[#0078d4] text-white shadow-xs'
              : isTurboTheme
              ? 'text-[#55FFFF] hover:text-[#FFFF55] hover:bg-[#000088]'
              : isOcalTheme
              ? 'text-[#858585] hover:text-[#e8e8e8] hover:bg-[#121318]'
              : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#222222]'
          }`}
          title="Project Launcher & Welcome Hub"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        {navItems.map((item) => {
          const isActive = sidebarOpen && sidebarTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabClick(item.id)}
              className={`relative flex items-center justify-center w-8 h-8 rounded transition-colors cursor-pointer ${
                isActive
                  ? isTurboTheme
                    ? 'bg-[#000077] text-[#FFFF55] border border-[#55FFFF]'
                    : isOcalTheme
                    ? 'bg-[#181920] text-[#34d058] border border-[#252536] shadow-xs'
                    : 'bg-[#2a2a2a] text-white shadow-2xs'
                  : isTurboTheme
                  ? 'text-[#55FFFF] hover:text-[#FFFF55] hover:bg-[#000088]'
                  : isOcalTheme
                  ? 'text-[#858585] hover:text-[#e8e8e8] hover:bg-[#121318]'
                  : 'text-[#858585] hover:text-[#cccccc] hover:bg-[#222222]'
              }`}
              title={item.label}
            >
              {isActive && !isTurboTheme && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[#0078d4] rounded-r" />
              )}
              {item.icon}

              {item.badge !== undefined && (
                <span
                  className={`absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                    errorCount > 0
                      ? 'bg-[#f14c4c] text-white'
                      : 'bg-[#cca700] text-black'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Nav Items */}
      <div className="flex flex-col items-center gap-1 w-full">
        <button
          type="button"
          onClick={() => toggleSidebar()}
          className={`flex items-center justify-center w-8 h-8 rounded transition-colors cursor-pointer ${
            isTurboTheme ? 'text-[#55FFFF] hover:text-[#FFFF55] hover:bg-[#000088]' : 'hover:bg-[#222222] text-[#858585] hover:text-[#cccccc]'
          }`}
          title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {sidebarOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeft className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          onClick={() => setShowShortcutsModal(true)}
          className={`flex items-center justify-center w-8 h-8 rounded transition-colors cursor-pointer ${
            isTurboTheme ? 'text-[#55FFFF] hover:text-[#FFFF55] hover:bg-[#000088]' : 'hover:bg-[#222222] text-[#858585] hover:text-[#cccccc]'
          }`}
          title="Shortcuts & Rules (F1)"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => setShowSettingsModal(true)}
          className={`flex items-center justify-center w-8 h-8 rounded transition-colors cursor-pointer ${
            isTurboTheme ? 'text-[#55FFFF] hover:text-[#FFFF55] hover:bg-[#000088]' : 'hover:bg-[#222222] text-[#858585] hover:text-[#cccccc]'
          }`}
          title="Compiler Settings (Ctrl+,)"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => setShowAboutModal(true)}
          className={`flex items-center justify-center w-8 h-8 rounded transition-colors cursor-pointer ${
            isTurboTheme ? 'text-[#55FFFF] hover:text-[#FFFF55] hover:bg-[#000088]' : 'hover:bg-[#222222] text-[#858585] hover:text-[#0078d4]'
          }`}
          title="About Ocal Code & Updates"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
