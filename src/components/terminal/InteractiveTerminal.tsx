import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { useIDEStore } from '../../store/ideStore';
import { Play, Square, Trash2, CornerDownLeft, Terminal as TerminalIcon } from 'lucide-react';
import { useCompiler } from '../../hooks/useCompiler';

export const InteractiveTerminal: React.FC = () => {
  const terminalContainerRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { isRunning, isCompiling, theme, lastBinaryPath } = useIDEStore();
  const { killProcess, runLastCompiledBinary } = useCompiler();
  const [inputValue, setInputValue] = useState('');

  const isTurboTheme = theme === 'turbo-nostalgia';

  useEffect(() => {
    if (!terminalContainerRef.current) return;

    // Clean any prior instances
    terminalContainerRef.current.innerHTML = '';

    // Initialize Xterm with Windows Terminal / VS Code console palette
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
        : theme === 'ocal-signature'
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

    // Clean Windows Console Banner
    term.writeln('\x1b[36mOcal Code Interactive Terminal Console\x1b[0m');
    term.writeln('Standard input/output active. Press \x1b[33mF5\x1b[0m to build & execute.\r\n');

    // Handle keystrokes
    const disposableOnData = term.onData((data) => {
      if (window.electronAPI) {
        if (data === '\r') {
          term.write('\r\n');
          window.electronAPI.sendInput('\r\n');
        } else if (data === '\x7f' || data === '\b') {
          term.write('\b \b');
          window.electronAPI.sendInput('\b');
        } else {
          term.write(data);
          window.electronAPI.sendInput(data);
        }
      } else {
        if (data === '\r') {
          term.write('\r\n');
        } else {
          term.write(data);
        }
      }
    });

    // Listen to native output
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
  }, [isTurboTheme]);

  const handleClear = () => {
    termRef.current?.clear();
  };

  const handleSendInput = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue) return;

    if (termRef.current) {
      termRef.current.writeln(`\x1b[32m> ${inputValue}\x1b[0m`);
    }

    if (window.electronAPI) {
      window.electronAPI.sendInput(`${inputValue}\n`);
    }

    setInputValue('');
  };

  const focusTerminal = () => {
    termRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#181818] relative overflow-hidden select-text">
      {/* Terminal Toolbar */}
      <div
        className={`flex items-center justify-between px-2.5 py-1 text-xs border-b shrink-0 select-none ${
          isTurboTheme
            ? 'bg-[#000088] border-turbo-cyan/20 text-turbo-cyan font-dos'
            : 'bg-[#1f1f1f] border-[#2b2b2b] text-[#858585] font-sans'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[11px] text-[#cccccc] flex items-center gap-1.5">
            <TerminalIcon className="w-3.5 h-3.5 text-[#0078d4]" />
            <span>Interactive Terminal</span>
          </span>
          {isCompiling ? (
            <span className="flex items-center gap-1 text-[#60cdff] bg-[#0078d4]/15 px-2 py-0.2 rounded text-[10px] font-medium border border-[#0078d4]/40 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#60cdff]" />
              Compiling...
            </span>
          ) : isRunning ? (
            <span className="flex items-center gap-1 text-[#23d18b] bg-[#23d18b]/10 px-2 py-0.2 rounded text-[10px] font-medium border border-[#23d18b]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#23d18b]" />
              Running
            </span>
          ) : (
            <span className="text-[#666666] text-[10px] px-1.5 py-0.2 rounded bg-[#252525]">
              Idle
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
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

          {!isRunning && lastBinaryPath && (
            <button
              type="button"
              onClick={runLastCompiledBinary}
              className="flex items-center gap-1 px-2 py-0.5 bg-[#252525] hover:bg-[#2e2e2e] text-[#cccccc] hover:text-white rounded border border-[#333333] transition-colors text-[11px] font-medium cursor-pointer"
              title="Re-run binary"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Re-run</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:text-white hover:bg-[#2a2a2a] rounded transition-colors text-[#858585] cursor-pointer"
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

      {/* Input Bar */}
      <form
        onSubmit={handleSendInput}
        className={`flex items-center gap-2 px-2.5 py-1 border-t shrink-0 select-none ${
          isTurboTheme
            ? 'bg-[#000077] border-[#55FFFF] text-white font-dos'
            : 'bg-[#1f1f1f] border-[#2b2b2b] text-[#cccccc]'
        }`}
      >
        <span className={`text-xs font-mono font-bold shrink-0 ${isTurboTheme ? 'text-[#55FFFF]' : 'text-[#0078d4]'}`}>{'>'}</span>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={
            isCompiling
              ? 'Compiling code... Execution will start shortly...'
              : isRunning
              ? 'Input for cin / scanf (press Enter to send)...'
              : 'Program not running. Press Run (F5 / Ctrl+F9) to start...'
          }
          disabled={!isRunning}
          className={`flex-1 rounded px-2.5 py-0.5 text-xs outline-none font-mono transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isTurboTheme
              ? 'bg-[#000055] border border-[#55FFFF] text-[#FFFF55] placeholder-[#888888] focus:border-[#FFFF55]'
              : 'bg-[#181818] border border-[#333333] text-[#cccccc] placeholder-[#666666] focus:border-[#0078d4]'
          }`}
        />
        <button
          type="submit"
          disabled={!isRunning || !inputValue}
          className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
            isRunning && inputValue
              ? isTurboTheme
                ? 'bg-[#0000AA] text-[#FFFF55] border border-[#55FFFF] hover:bg-[#000088]'
                : 'bg-[#0078d4] text-white hover:bg-[#1084d8]'
              : isTurboTheme
              ? 'bg-[#000055] text-[#888888] border border-[#000088] opacity-60 cursor-not-allowed'
              : 'bg-[#252525] text-[#666666] border border-[#333333] opacity-60 cursor-not-allowed'
          }`}
          title="Send to stdin"
        >
          <span>Send</span>
          <CornerDownLeft className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
