import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { useIDEStore } from '../../store/ideStore';

export const InteractiveTerminal: React.FC = () => {
  const terminalContainerRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { theme, workspacePath } = useIDEStore();

  const isTurboTheme = theme === 'turbo-nostalgia';
  const isOcalTheme = theme === 'ocal-signature';

  useEffect(() => {
    if (!terminalContainerRef.current) return;

    terminalContainerRef.current.innerHTML = '';

    // Initialize Xterm
    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'bar',
      fontFamily: '"Cascadia Code", "JetBrains Mono", Consolas, "Courier New", monospace',
      fontSize: 13,
      lineHeight: 1.25,
      theme: isTurboTheme
        ? {
            background: '#000000',
            foreground: '#00FF00',
            cursor: '#55FFFF',
            black: '#000000',
            red: '#FF5555',
            green: '#55FF55',
            yellow: '#FFFF55',
            blue: '#5555FF',
            magenta: '#FF55FF',
            cyan: '#55FFFF',
            white: '#FFFFFF',
          }
        : isOcalTheme
        ? {
            background: '#0c0c0c',
            foreground: '#e8e8e8',
            cursor: '#34d058',
            black: '#121318',
            red: '#f43f5e',
            green: '#34d058',
            yellow: '#e8ff47',
            blue: '#38bdf8',
            magenta: '#818cf8',
            cyan: '#2dd4bf',
            white: '#f8fafc',
          }
        : {
            background: '#181818',
            foreground: '#cccccc',
            cursor: '#ffffff',
            black: '#1f1f1f',
            red: '#f14c4c',
            green: '#23d18b',
            yellow: '#cca700',
            blue: '#3b8eea',
            magenta: '#bc3fbc',
            cyan: '#29b8db',
            white: '#e5e5e5',
          },
      convertEol: true,
      scrollback: 5000,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalContainerRef.current);

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    // Initial resize and start PTY
    const initTimer = setTimeout(() => {
      try {
        fitAddon.fit();
        if (window.electronAPI) {
          window.electronAPI.startTerminalSession(
            workspacePath || undefined,
            term.cols || 80,
            term.rows || 24
          );
        }
        term.focus();
      } catch (err) {
        console.error('PTY start error:', err);
      }
    }, 40);

    // Direct keystroke streaming into ConPTY / node-pty
    const disposableOnData = term.onData((data) => {
      if (window.electronAPI) {
        window.electronAPI.sendTerminalInput(data);
      }
    });

    // Listen to native stdout/stderr from real PTY shell
    let unsubTerminalData: (() => void) | undefined;
    if (window.electronAPI) {
      unsubTerminalData = window.electronAPI.onTerminalData((data) => {
        term.write(data);
      });
    }

    // Auto-fit on resize & notify PTY of new geometry
    const handleResize = () => {
      try {
        fitAddon.fit();
        if (window.electronAPI && term.cols && term.rows) {
          window.electronAPI.resizeTerminal(term.cols, term.rows);
        }
      } catch {}
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (terminalContainerRef.current) {
      resizeObserver.observe(terminalContainerRef.current);
    }
    window.addEventListener('resize', handleResize);

    // Ensure focus when clicking anywhere in the container
    const container = terminalContainerRef.current;
    const handleContainerClick = () => {
      term.focus();
    };
    container?.addEventListener('click', handleContainerClick);

    return () => {
      clearTimeout(initTimer);
      disposableOnData.dispose();
      if (unsubTerminalData) unsubTerminalData();
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      container?.removeEventListener('click', handleContainerClick);
      term.dispose();
    };
  }, [isTurboTheme, isOcalTheme, workspacePath]);

  return (
    <div
      ref={terminalContainerRef}
      className="w-full h-full p-2 overflow-hidden cursor-text select-text focus:outline-none"
      tabIndex={0}
      onClick={() => termRef.current?.focus()}
    />
  );
};
