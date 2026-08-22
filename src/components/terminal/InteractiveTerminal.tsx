import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { useIDEStore } from '../../store/ideStore';
import { Play, Square, Trash2, CornerDownLeft, Terminal as TerminalIcon, RotateCw, Sparkles, Package } from 'lucide-react';
import { useCompiler } from '../../hooks/useCompiler';

export const InteractiveTerminal: React.FC = () => {
  const terminalContainerRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { isRunning, isCompiling, theme, lastBinaryPath, workspacePath } = useIDEStore();
  const { killProcess, runLastCompiledBinary } = useCompiler();
  const [inputValue, setInputValue] = useState('');

  const isTurboTheme = theme === 'turbo-nostalgia';
  const isOcalTheme = theme === 'ocal-signature';

  // Initialize interactive terminal & shell session
  useEffect(() => {
    if (!terminalContainerRef.current) return;

    // Clean any prior instances
    terminalContainerRef.current.innerHTML = '';

    // Initialize Xterm
    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'bar',
      fontFamily: '"Cascadia Code", Consolas, "Courier New", monospace',
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
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalContainerRef.current);

    const timer = setTimeout(() => {
      try {
        fitAddon.fit();
      } catch {}
    }, 50);

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    // Start live persistent shell session in workspace directory
    if (window.electronAPI) {
      window.electronAPI.startTerminalSession(workspacePath || undefined);
    }

    // Direct keystrokes handling
    const disposableOnData = term.onData((data) => {
      if (window.electronAPI) {
        window.electronAPI.sendTerminalInput(data);
      }
    });

    // Listen to native stdout/stderr from shell & compilers
    let unsubTerminalData: (() => void) | undefined;
    if (window.electronAPI) {
      unsubTerminalData = window.electronAPI.onTerminalData((data) => {
        term.write(data);
      });
    }

    const resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit();
      } catch {}
    });
    if (terminalContainerRef.current) {
      resizeObserver.observe(terminalContainerRef.current);
    }

    return () => {
      clearTimeout(timer);
      disposableOnData.dispose();
      if (unsubTerminalData) unsubTerminalData();
      resizeObserver.disconnect();
      term.dispose();
    };
  }, [isTurboTheme, isOcalTheme, workspacePath]);

  const handleClear = () => {
    termRef.current?.clear();
  };

  const handleRestartShell = () => {
    if (window.electronAPI) {
      window.electronAPI.restartTerminalSession(workspacePath || undefined);
    }
  };

  const handleSendInput = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    if (window.electronAPI) {
      window.electronAPI.sendTerminalInput(`${inputValue}\r\n`);
    }

    setInputValue('');
  };

  const runQuickCommand = (cmd: string) => {
    if (window.electronAPI) {
      window.electronAPI.sendTerminalInput(`${cmd}\r\n`);
      termRef.current?.focus();
    }
  };

  const focusTerminal = () => {
    termRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0c0c0c] relative overflow-hidden select-text">
      {/* Terminal Toolbar */}
      <div
        className={`flex items-center justify-between px-2.5 py-1 text-xs border-b shrink-0 select-none ${
          isTurboTheme
            ? 'bg-[#000088] border-turbo-cyan/20 text-turbo-cyan font-dos'
            : isOcalTheme
            ? 'bg-[#121318] border-[#252536] text-[#858585] font-sans'
            : 'bg-[#1f1f1f] border-[#2b2b2b] text-[#858585] font-sans'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[11px] text-[#cccccc] flex items-center gap-1.5">
            <TerminalIcon className="w-3.5 h-3.5 text-[#34d058]" />
            <span>Interactive Terminal</span>
          </span>

          {/* Quick Command Pills */}
          <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-[#252536]">
            <button
              type="button"
              onClick={() => runQuickCommand('npm run dev')}
              className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-[#38bdf8]/10 text-[#38bdf8] hover:bg-[#38bdf8]/20 border border-[#38bdf8]/30 cursor-pointer transition-colors"
              title="Run: npm run dev"
            >
              npm run dev
            </button>
            <button
              type="button"
              onClick={() => runQuickCommand('npm start')}
              className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-[#34d058]/10 text-[#34d058] hover:bg-[#34d058]/20 border border-[#34d058]/30 cursor-pointer transition-colors"
              title="Run: npm start"
            >
              npm start
            </button>
            <button
              type="button"
              onClick={() => runQuickCommand('npm install')}
              className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 cursor-pointer transition-colors"
              title="Run: npm install"
            >
              npm install
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isRunning && (
            <button
              type="button"
              onClick={killProcess}
              className="flex items-center gap-1 px-2 py-0.5 bg-[#f14c4c] hover:bg-[#d83b3b] text-white rounded transition-colors text-[11px] font-medium cursor-pointer"
              title="Stop process (Shift+F5)"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRestartShell}
            className="p-1 hover:text-white hover:bg-[#252536] rounded transition-colors text-[#858585] cursor-pointer"
            title="Restart Terminal Shell Session"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:text-white hover:bg-[#252536] rounded transition-colors text-[#858585] cursor-pointer"
            title="Clear Terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Canvas */}
      <div
        className="flex-1 w-full p-2 overflow-hidden min-h-0 cursor-text"
        ref={terminalContainerRef}
        onClick={focusTerminal}
      />

      {/* Input Bar for commands and stdin */}
      <form
        onSubmit={handleSendInput}
        className={`flex items-center gap-2 px-2.5 py-1 border-t shrink-0 select-none ${
          isTurboTheme
            ? 'bg-[#000077] border-[#55FFFF] text-white font-dos'
            : isOcalTheme
            ? 'bg-[#121318] border-[#252536] text-[#e8e8e8]'
            : 'bg-[#1f1f1f] border-[#2b2b2b] text-[#cccccc]'
        }`}
      >
        <span className={`text-xs font-mono font-bold shrink-0 ${isTurboTheme ? 'text-[#55FFFF]' : 'text-[#34d058]'}`}>{'>'}</span>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Execute shell commands (npm, javac, java, python, git...) or type input..."
          className={`flex-1 rounded px-2.5 py-0.5 text-xs outline-none font-mono transition-colors ${
            isTurboTheme
              ? 'bg-[#000055] border border-[#55FFFF] text-[#FFFF55] placeholder-[#888888] focus:border-[#FFFF55]'
              : isOcalTheme
              ? 'bg-[#0c0c0c] border border-[#252536] text-[#e8e8e8] placeholder-[#666666] focus:border-[#34d058]'
              : 'bg-[#181818] border border-[#333333] text-[#cccccc] placeholder-[#666666] focus:border-[#0078d4]'
          }`}
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
            inputValue.trim()
              ? isTurboTheme
                ? 'bg-[#0000AA] text-[#FFFF55] border border-[#55FFFF] hover:bg-[#000088]'
                : isOcalTheme
                ? 'bg-[#34d058] text-black font-bold hover:bg-[#2ea043]'
                : 'bg-[#0078d4] text-white hover:bg-[#1084d8]'
              : 'bg-[#252525] text-[#666666] border border-[#333333] opacity-60 cursor-not-allowed'
          }`}
          title="Send command"
        >
          <span>Run</span>
          <CornerDownLeft className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
