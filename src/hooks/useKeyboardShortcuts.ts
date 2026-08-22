import { useEffect } from 'react';
import { useIDEStore } from '../store/ideStore';
import { useCompiler } from './useCompiler';

export function useKeyboardShortcuts() {
  const {
    saveCurrentFile,
    openFileFromDisk,
    addNewFile,
    closeFile,
    activeFileId,
    setShowShortcutsModal,
    setShowSettingsModal,
    showShortcutsModal,
    showSettingsModal,
    toggleSidebar,
  } = useIDEStore();

  const { compileActiveFile, runLastCompiledBinary, compileAndRun, killProcess } = useCompiler();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F1: Help / Shortcuts modal
      if (e.key === 'F1') {
        e.preventDefault();
        setShowShortcutsModal(!showShortcutsModal);
        return;
      }

      // F2: Save File
      if (e.key === 'F2') {
        e.preventDefault();
        saveCurrentFile();
        return;
      }

      // F3: Open File
      if (e.key === 'F3') {
        e.preventDefault();
        openFileFromDisk();
        return;
      }

      // Ctrl + F9: Compile Only
      if ((e.ctrlKey || e.metaKey) && e.key === 'F9') {
        e.preventDefault();
        compileActiveFile();
        return;
      }

      // Ctrl + F5: Run Binary
      if ((e.ctrlKey || e.metaKey) && e.key === 'F5') {
        e.preventDefault();
        runLastCompiledBinary();
        return;
      }

      // F5: Compile & Run
      if (e.key === 'F5' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        compileAndRun();
        return;
      }

      // Ctrl + C with nothing selected while running: Stop/Kill
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !window.getSelection()?.toString()) {
        // Can be handled inside terminal or global kill
      }

      // Ctrl + S: Save File
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveCurrentFile();
        return;
      }

      // Ctrl + O: Open File
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        openFileFromDisk();
        return;
      }

      // Ctrl + N: New File
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        addNewFile();
        return;
      }

      // Ctrl + W: Close Active Tab
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        closeFile(activeFileId);
        return;
      }

      // Ctrl + ,: Open Settings
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setShowSettingsModal(!showSettingsModal);
        return;
      }

      // Ctrl + B: Toggle Left Sidebar
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // Escape: Close modals
      if (e.key === 'Escape') {
        if (showShortcutsModal) setShowShortcutsModal(false);
        if (showSettingsModal) setShowSettingsModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    saveCurrentFile,
    openFileFromDisk,
    addNewFile,
    closeFile,
    activeFileId,
    compileActiveFile,
    runLastCompiledBinary,
    compileAndRun,
    killProcess,
    showShortcutsModal,
    showSettingsModal,
    setShowShortcutsModal,
    setShowSettingsModal,
    toggleSidebar,
  ]);
}
