import React, { useEffect, useRef } from 'react';
import Editor, { OnMount, BeforeMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { useIDEStore } from '../../store/ideStore';
import { defineMonacoThemes } from '../../themes/monacoThemes';
import { useCompiler } from '../../hooks/useCompiler';

export const CodeEditor: React.FC = () => {
  const { files, activeFileId, updateFileContent, theme, diagnostics, setCursorPos } =
    useIDEStore();
  const { triggerDebouncedSyntaxCheck } = useCompiler();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const handleBeforeMount: BeforeMount = (monacoInstance) => {
    defineMonacoThemes(monacoInstance);
  };

  const handleEditorMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;

    // Track cursor movements for status bar
    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });

    // Initial syntax check
    triggerDebouncedSyntaxCheck();
  };

  // Sync Diagnostics / Error markers with Monaco
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    const markers: monaco.editor.IMarkerData[] = diagnostics.map((diag) => {
      let severity = monaco.MarkerSeverity.Info;
      if (diag.severity === 'error') severity = monaco.MarkerSeverity.Error;
      else if (diag.severity === 'warning') severity = monaco.MarkerSeverity.Warning;

      const maxLine = model.getLineCount();
      const line = Math.max(1, Math.min(diag.line, maxLine));
      const lineMaxCol = model.getLineMaxColumn(line);
      const col = Math.max(1, Math.min(diag.column || 1, lineMaxCol));

      return {
        startLineNumber: line,
        startColumn: col,
        endLineNumber: line,
        endColumn: Math.min(col + 10, lineMaxCol),
        message: diag.message,
        severity,
        source: diag.source || 'Compiler Diagnostic',
      };
    });

    monacoRef.current.editor.setModelMarkers(model, 'compiler-diagnostics', markers);
  }, [diagnostics]);

  const handleContentChange = (value?: string) => {
    if (value !== undefined && activeFile) {
      updateFileContent(activeFile.id, value);
      triggerDebouncedSyntaxCheck();
    }
  };

  const getMonacoLanguage = (lang?: string, fileName?: string): string => {
    switch (lang) {
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'python':
        return 'python';
      case 'java':
        return 'java';
      case 'javascript':
        return 'javascript';
      case 'typescript':
        return 'typescript';
      case 'react':
      case 'nextjs':
        return fileName?.endsWith('.jsx') ? 'javascript' : 'typescript';
      case 'c':
        return 'c';
      case 'cpp':
      default:
        return 'cpp';
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col bg-inherit">
      <Editor
        height="100%"
        width="100%"
        language={getMonacoLanguage(activeFile?.language, activeFile?.name)}
        value={activeFile ? activeFile.content : ''}
        theme={theme}
        beforeMount={handleBeforeMount}
        onMount={handleEditorMount}
        onChange={handleContentChange}
        options={{
          // ========================================================
          // STRICT LEARNING MODE: ALL AUTOCOMPLETE & HINTS DISABLED
          // ========================================================
          quickSuggestions: false,
          suggestOnTriggerCharacters: false,
          parameterHints: { enabled: false },
          wordBasedSuggestions: 'off',
          snippetSuggestions: 'none',
          hover: { enabled: false },
          inlineSuggest: { enabled: false },
          codeLens: false,
          lightbulb: { enabled: monaco.editor.ShowLightbulbIconMode.Off },
          acceptSuggestionOnCommitCharacter: false,
          acceptSuggestionOnEnter: 'off',
          tabCompletion: 'off',
          suggest: {
            showKeywords: false,
            showSnippets: false,
            showWords: false,
            showFunctions: false,
            showVariables: false,
            showClasses: false,
            showModules: false,
            showProperties: false,
            showValues: false,
            showUnits: false,
            showColors: false,
            showFiles: false,
            showReferences: false,
            showFolders: false,
            showTypeParameters: false,
            showIssues: false,
            showUsers: false,
          },

          // ========================================================
          // STYLING, FULL CODE MINIMAP & SLEEK SCROLLBAR CONTROLS
          // ========================================================
          fontSize: 14,
          fontFamily: '"Cascadia Code", Consolas, "Courier New", monospace',
          fontLigatures: true,
          cursorBlinking: 'blink',
          cursorSmoothCaretAnimation: 'on',
          cursorStyle: 'line',
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          renderWhitespace: 'selection',

          // Full Code Minimap Preview on the Right
          minimap: {
            enabled: true,
            side: 'right',
            renderCharacters: true,
            maxColumn: 120,
            scale: 1,
            showSlider: 'always',
            autohide: false,
          },

          // Modern Sleek Scrollbars
          scrollbar: {
            vertical: 'visible',
            horizontal: 'auto',
            useShadows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
            verticalSliderSize: 10,
            horizontalSliderSize: 10,
            arrowSize: 0,
          },

          overviewRulerBorder: false,
          overviewRulerLanes: 3,
          glyphMargin: true,
          folding: true,
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          padding: { top: 12, bottom: 12 },
          automaticLayout: true,
        }}
      />
    </div>
  );
};
