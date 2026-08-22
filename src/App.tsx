import React from 'react';
import { useIDEStore } from './store/ideStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { HeaderToolbar } from './components/toolbar/HeaderToolbar';
import { ActivityBar } from './components/panels/ActivityBar';
import { LeftSidebar } from './components/panels/LeftSidebar';
import { EditorTabs } from './components/editor/EditorTabs';
import { CodeEditor } from './components/editor/CodeEditor';
import { BottomPanel } from './components/panels/BottomPanel';
import { StatusBar } from './components/toolbar/StatusBar';
import { ShortcutsHelpModal } from './components/modals/ShortcutsHelpModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { AboutModal } from './components/modals/AboutModal';
import { ProjectLauncher } from './components/welcome/ProjectLauncher';

export const App: React.FC = () => {
  const { theme, sidebarOpen, files, showProjectLauncher } = useIDEStore();

  // Attach global keyboard shortcuts (F1, F2, F3, F5, Ctrl+F9, Ctrl+F5, etc.)
  useKeyboardShortcuts();

  const isOcalTheme = theme === 'ocal-signature';
  const isTurboTheme = theme === 'turbo-nostalgia';
  const isCyberpunk = theme === 'cyberpunk-neon';
  const isLight = theme === 'modern-light';

  let themeWrapperClass = isOcalTheme ? 'bg-[#0c0c0c] text-[#e8e8e8]' : 'bg-[#181818] text-[#cccccc]';
  if (isTurboTheme) {
    themeWrapperClass = 'bg-[#0000AA] text-white font-dos';
  } else if (isCyberpunk) {
    themeWrapperClass = 'bg-[#0d081a] text-pink-100';
  } else if (isLight) {
    themeWrapperClass = 'bg-[#f4f5f8] text-[#1c1c1e]';
  }

  const isLauncherActive = showProjectLauncher || files.length === 0;

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden select-none ${themeWrapperClass}`}>
      {/* Titlebar Header */}
      <HeaderToolbar />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 overflow-hidden min-h-0 relative">
        {/* Activity Bar */}
        <ActivityBar />

        {/* Left Sidebar (Files, Templates, Diagnostics, Settings) */}
        {sidebarOpen && <LeftSidebar />}

        {/* Center Studio Area (Tabs, Editor, Bottom Dock / Welcome Hub) */}
        <main className={`flex flex-col flex-1 min-w-0 overflow-hidden ${isOcalTheme ? 'bg-[#0c0c0c]' : 'bg-[#1e1e1e]'}`}>
          {isLauncherActive ? (
            <ProjectLauncher />
          ) : (
            <>
              <EditorTabs />

              <div className={`flex-1 min-h-0 relative ${isOcalTheme ? 'bg-[#0c0c0c]' : 'bg-[#1e1e1e]'}`}>
                <CodeEditor />
              </div>

              <BottomPanel />
            </>
          )}
        </main>
      </div>

      {/* Status Bar */}
      <StatusBar />

      {/* Modals */}
      <ShortcutsHelpModal />
      <SettingsModal />
      <AboutModal />
    </div>
  );
};

export default App;
