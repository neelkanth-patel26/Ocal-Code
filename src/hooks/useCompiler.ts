import { useCallback, useEffect, useRef } from 'react';
import { useIDEStore } from '../store/ideStore';
import { DiagnosticItem, BuildResult } from '../types/ide';

export function useCompiler() {
  const {
    files,
    activeFileId,
    compilerConfig,
    setIsCompiling,
    setIsRunning,
    setLastBuildResult,
    setLastBinaryPath,
    setActivePid,
    setDiagnostics,
    addBuildLog,
    clearBuildLogs,
    setActiveBottomTab,
    lastBinaryPath,
    setAssemblyCode,
    setToolchains,
  } = useIDEStore();

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize toolchain detection on mount
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.detectToolchains().then((toolchains) => {
        setToolchains(toolchains);
        const defaultCompiler = toolchains.find((t) => t.detected);
        if (defaultCompiler) {
          addBuildLog(`[Toolchain] Detected ${defaultCompiler.name} (${defaultCompiler.version})`);
        } else {
          addBuildLog(`[Toolchain Warning] No local gcc/g++ detected in PATH. Set manual compiler path in Settings.`);
        }
      });

      const unsubExit = window.electronAPI.onProcessExit(({ code, signal }) => {
        setIsRunning(false);
        setActivePid(null);
        addBuildLog(`\n[Process Finished] Exit Code: ${code !== null ? code : signal || 0}`);
        if (code !== null && code >= 0) {
          window.electronAPI?.writeTerminal(
            `\r\n\x1b[90m--------------------------------------------------\x1b[0m\r\n\x1b[36m[Process finished with exit code ${code}]\x1b[0m\r\n`
          );
        }
      });

      return () => {
        unsubExit();
      };
    } else {
      addBuildLog('[Environment] Running in Web Preview mode. Connect Electron desktop app for native gcc compilation.');
    }
  }, []);

  const getActiveFile = useCallback(() => {
    return files.find((f) => f.id === activeFileId);
  }, [files, activeFileId]);

  // Real-time Background Syntax Checking (Diagnostics)
  const runSyntaxCheck = useCallback(async () => {
    const activeFile = getActiveFile();
    if (!activeFile) return;

    if (window.electronAPI) {
      try {
        const diags = await window.electronAPI.checkSyntax({
          sourceCode: activeFile.content,
          fileName: activeFile.name,
          language: activeFile.language,
          compilerPath: compilerConfig.compilerType !== 'auto' ? compilerConfig.compilerType : undefined,
          standard: compilerConfig.standard,
        });

        setDiagnostics(diags);
      } catch (err: any) {
        console.error('Syntax check error:', err);
      }
    } else {
      // Simple client-side fallback linter for web demo
      const clientDiags: DiagnosticItem[] = [];
      const lines = activeFile.content.split('\n');
      let openBraces = 0;
      let openParens = 0;

      lines.forEach((line, idx) => {
        for (const char of line) {
          if (char === '{') openBraces++;
          if (char === '}') openBraces--;
          if (char === '(') openParens++;
          if (char === ')') openParens--;
        }
        const trimmed = line.trim();
        if (
          trimmed.length > 0 &&
          !trimmed.endsWith(';') &&
          !trimmed.endsWith('{') &&
          !trimmed.endsWith('}') &&
          !trimmed.endsWith(':') &&
          !trimmed.startsWith('#') &&
          !trimmed.startsWith('//') &&
          !trimmed.startsWith('/*') &&
          !trimmed.startsWith('*') &&
          !trimmed.includes('for (') &&
          !trimmed.includes('if (') &&
          !trimmed.includes('while (') &&
          !trimmed.includes('else') &&
          (trimmed.includes('int ') || trimmed.includes('std::') || trimmed.includes('return ') || trimmed.includes('printf'))
        ) {
          clientDiags.push({
            id: `client_diag_${idx}`,
            fileName: activeFile.name,
            line: idx + 1,
            column: line.length,
            message: 'Expected \';\' at end of statement',
            severity: 'error',
            source: 'linter',
          });
        }
      });

      if (openBraces !== 0) {
        clientDiags.push({
          id: 'client_diag_braces',
          fileName: activeFile.name,
          line: lines.length,
          column: 1,
          message: openBraces > 0 ? 'Unclosed \'{\' brace' : 'Extra \'}\' brace',
          severity: 'error',
          source: 'linter',
        });
      }

      setDiagnostics(clientDiags);
    }
  }, [getActiveFile, compilerConfig, setDiagnostics]);

  // Debounced trigger for syntax check whenever active file content changes
  const triggerDebouncedSyntaxCheck = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      runSyntaxCheck();
    }, compilerConfig.autoLintDebounceMs || 700);
  }, [runSyntaxCheck, compilerConfig.autoLintDebounceMs]);

  // Compile Active File (Ctrl+F9)
  const compileActiveFile = useCallback(
    async (options?: { stayOnTerminal?: boolean }): Promise<BuildResult> => {
      const activeFile = getActiveFile();
      if (!activeFile) {
        const errRes: BuildResult = {
          success: false,
          exitCode: -1,
          stdout: '',
          stderr: 'No active file selected.',
          durationMs: 0,
          diagnostics: [],
        };
        return errRes;
      }

      setIsCompiling(true);
      clearBuildLogs();

      if (!options?.stayOnTerminal) {
        setActiveBottomTab('build-output');
      }

      const startMsg = `>>> Compiling ${activeFile.name} [Target: ${activeFile.language.toUpperCase()}, Standard: ${compilerConfig.standard}]...`;
      addBuildLog(startMsg);

      if (window.electronAPI) {
        try {
          const result = await window.electronAPI.compile({
            sourceCode: activeFile.content,
            fileName: activeFile.name,
            language: activeFile.language,
            compilerPath: compilerConfig.compilerType !== 'auto' ? compilerConfig.compilerType : undefined,
            standard: compilerConfig.standard,
            optimization: compilerConfig.optimization,
            warnings: compilerConfig.warnings,
            customFlags: compilerConfig.customFlags,
          });

          setIsCompiling(false);
          setLastBuildResult(result);
          setDiagnostics(result.diagnostics);

          if (result.stdout) addBuildLog(result.stdout);
          if (result.stderr) addBuildLog(result.stderr);

          if (result.success && result.outputPath) {
            setLastBinaryPath(result.outputPath);
            addBuildLog(`\n[Build Succeeded] Time: ${result.durationMs}ms`);
            addBuildLog(`[Output Binary] ${result.outputPath}`);
          } else {
            addBuildLog(`\n[Build Failed] Exit Code: ${result.exitCode} (${result.durationMs}ms)`);
            if (result.diagnostics.length > 0 && !options?.stayOnTerminal) {
              setActiveBottomTab('problems');
            }
          }
          return result;
        } catch (err: any) {
          setIsCompiling(false);
          const errMsg = `Compiler spawn failure: ${err.message}`;
          addBuildLog(errMsg);
          const res: BuildResult = {
            success: false,
            exitCode: -1,
            stdout: '',
            stderr: errMsg,
            durationMs: 0,
            diagnostics: [],
          };
          setLastBuildResult(res);
          return res;
        }
      } else {
        await new Promise((r) => setTimeout(r, 600));
        setIsCompiling(false);
        addBuildLog('Web preview mock compilation complete.');
        const res: BuildResult = {
          success: true,
          exitCode: 0,
          stdout: 'Mock compiler output: Build succeeded',
          stderr: '',
          outputPath: 'simulated_binary.wasm',
          durationMs: 42,
          diagnostics: [],
        };
        setLastBuildResult(res);
        return res;
      }
    },
    [getActiveFile, compilerConfig, setIsCompiling, clearBuildLogs, setActiveBottomTab, addBuildLog, setLastBuildResult, setDiagnostics, setLastBinaryPath]
  );

  // Run Binary (Ctrl+F5)
  const runLastCompiledBinary = useCallback(async () => {
    const binPath = lastBinaryPath;
    if (!binPath && window.electronAPI) {
      addBuildLog('No compiled executable binary found. Please compile first (F5 or Ctrl+F9).');
      setActiveBottomTab('build-output');
      return;
    }

    setIsRunning(true);
    setActiveBottomTab('terminal');

    if (window.electronAPI && binPath) {
      addBuildLog(`\n>>> Launching ${binPath}...`);
      window.electronAPI.writeTerminal(
        `\x1b[2J\x1b[H\x1b[32m>>> Launching executable: ${binPath}\x1b[0m\r\n\x1b[90m══════════════════════════════════════════════════\x1b[0m\r\n\r\n`
      );
      const res = await window.electronAPI.runExecutable(binPath);
      if (res.success && res.pid) {
        setActivePid(res.pid);
      } else {
        setIsRunning(false);
        addBuildLog(`Failed to run: ${res.error}`);
        window.electronAPI.writeTerminal(`\r\n\x1b[31m[Launch Error] ${res.error}\x1b[0m\r\n`);
      }
    }
  }, [lastBinaryPath, setIsRunning, setActiveBottomTab, addBuildLog, setActivePid]);

  // Compile and Run (F5)
  const compileAndRun = useCallback(async () => {
    const activeFile = getActiveFile();
    if (activeFile?.language === 'html' || activeFile?.language === 'css') {
      setActiveBottomTab('live-server');
      return;
    }

    setActiveBottomTab('terminal');

    // Instantly reset the terminal screen and show clear compiling feedback
    if (window.electronAPI && activeFile) {
      window.electronAPI.writeTerminal(
        `\x1b[2J\x1b[H\x1b[33m⏳ Compiling ${activeFile.name}... (executing shortly)\x1b[0m\r\n\x1b[90m══════════════════════════════════════════════════\x1b[0m\r\n`
      );
    }

    const buildRes = await compileActiveFile({ stayOnTerminal: true });
    if (buildRes.success) {
      if (buildRes.outputPath) {
        setLastBinaryPath(buildRes.outputPath);
      }
      setIsRunning(true);
      if (window.electronAPI && buildRes.outputPath) {
        window.electronAPI.writeTerminal(
          `\x1b[32m✔ Build Succeeded (${buildRes.durationMs}ms). Program Output:\x1b[0m\r\n\x1b[90m══════════════════════════════════════════════════\x1b[0m\r\n\r\n`
        );
        const runRes = await window.electronAPI.runExecutable(buildRes.outputPath);
        if (runRes.success && runRes.pid) {
          setActivePid(runRes.pid);
        } else {
          setIsRunning(false);
          window.electronAPI.writeTerminal(`\r\n\x1b[31m[Launch Failed] ${runRes.error}\x1b[0m\r\n`);
        }
      }
    } else {
      if (window.electronAPI) {
        window.electronAPI.writeTerminal(
          `\r\n\x1b[31m✖ Compilation Failed (Exit Code ${buildRes.exitCode}). Switch to Problems tab to inspect syntax issues.\x1b[0m\r\n\x1b[90m══════════════════════════════════════════════════\x1b[0m\r\n`
        );
      }
    }
  }, [getActiveFile, compileActiveFile, setLastBinaryPath, setActiveBottomTab, setIsRunning, setActivePid]);

  // Kill running process & instant reset
  const killProcess = useCallback(async () => {
    if (window.electronAPI) {
      await window.electronAPI.killProcess();
      setIsRunning(false);
      setActivePid(null);
      addBuildLog('[Process Stopped by User]');
      // Instant reset without lingering clutter
      window.electronAPI.writeTerminal(
        '\x1b[2J\x1b[H\x1b[36mOcal Code Interactive Terminal Console\x1b[0m\r\nStandard input/output active. Press \x1b[33mF5\x1b[0m to build & execute.\r\n\r\n'
      );
    }
  }, [setIsRunning, setActivePid, addBuildLog]);

  // Generate Assembly (g++ -S)
  const generateAssembly = useCallback(async () => {
    const activeFile = getActiveFile();
    if (!activeFile) return;

    setActiveBottomTab('assembly');
    if (window.electronAPI) {
      addBuildLog(`>>> Generating assembly for ${activeFile.name}...`);
      const res = await window.electronAPI.generateAssembly({
        sourceCode: activeFile.content,
        fileName: activeFile.name,
        language: activeFile.language,
        compilerPath: compilerConfig.compilerType !== 'auto' ? compilerConfig.compilerType : undefined,
        standard: compilerConfig.standard,
      });

      if (res.success && res.assembly) {
        setAssemblyCode(res.assembly);
        addBuildLog('Assembly generated successfully.');
      } else {
        setAssemblyCode(null);
        addBuildLog(`Assembly generation error: ${res.error}`);
      }
    }
  }, [getActiveFile, compilerConfig, setActiveBottomTab, addBuildLog, setAssemblyCode]);

  return {
    compileActiveFile,
    runLastCompiledBinary,
    compileAndRun,
    killProcess,
    generateAssembly,
    runSyntaxCheck,
    triggerDebouncedSyntaxCheck,
  };
}
