import React from 'react';
import { useIDEStore } from '../../store/ideStore';
import { X, Keyboard, Shield } from 'lucide-react';

export const ShortcutsHelpModal: React.FC = () => {
  const { showShortcutsModal, setShowShortcutsModal, theme } = useIDEStore();

  if (!showShortcutsModal) return null;

  const isTurboTheme = theme === 'turbo-nostalgia';

  const shortcuts = [
    { key: 'F5', desc: 'Compile & Run Interactive (Connects std::cin / scanf to terminal)' },
    { key: 'Ctrl + F9', desc: 'Compile Active File Only (Syntax check & binary generation)' },
    { key: 'Ctrl + F5', desc: 'Run Last Compiled Binary in terminal' },
    { key: 'F1', desc: 'Shortcuts & Help Guide' },
    { key: 'F2 / Ctrl + S', desc: 'Save Active File' },
    { key: 'F3 / Ctrl + O', desc: 'Open File from disk' },
    { key: 'Ctrl + N', desc: 'New File' },
    { key: 'Ctrl + W', desc: 'Close Tab' },
    { key: 'Ctrl + B', desc: 'Toggle Sidebar' },
    { key: 'Ctrl + ,', desc: 'Compiler Settings' },
    { key: 'Escape', desc: 'Close dialog' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        className={`w-full max-w-xl rounded shadow-popup overflow-hidden border ${
          isTurboTheme
            ? 'bg-[#0000AA] border-turbo-yellow text-white font-dos'
            : 'bg-[#202020] border-[#383838] text-[#cccccc] font-sans'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-4 py-2.5 border-b ${
            isTurboTheme
              ? 'bg-[#000077] border-turbo-yellow text-turbo-yellow'
              : 'bg-[#1f1f1f] border-[#2b2b2b] text-[#ffffff]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[#0078d4]" />
            <h2 className="font-semibold text-xs tracking-tight">
              Keyboard Shortcuts & Rules
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowShortcutsModal(false)}
            className="p-1 hover:text-white rounded hover:bg-[#2e2e2e] transition-colors text-[#858585] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {/* Strict Rule Notice */}
          <div
            className={`p-3 rounded border flex items-start gap-2.5 ${
              isTurboTheme
                ? 'bg-[#000055] border-turbo-cyan text-turbo-white'
                : 'bg-[#1a232e] border-[#234260] text-[#cccccc]'
            }`}
          >
            <Shield className="w-4 h-4 text-[#60cdff] shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <span className="font-semibold block text-[#60cdff]">
                Strict Learning Mode Active:
              </span>
              <p className="text-[#858585] leading-relaxed text-[11px]">
                Autocomplete popups are disabled to encourage manual syntax mastery and muscle memory. Compiler diagnostics run live in the editor.
              </p>
            </div>
          </div>

          {/* Shortcuts Grid */}
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-semibold uppercase text-[#858585]">
              Shortcuts
            </h3>

            <div className="grid grid-cols-1 gap-1 text-xs">
              {shortcuts.map((sc, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between px-3 py-1.5 rounded border ${
                    isTurboTheme
                      ? 'bg-[#000088] border-turbo-cyan/20 text-turbo-white'
                      : 'bg-[#252525] border-[#2d2d2d]'
                  }`}
                >
                  <kbd className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#181818] text-[#cccccc] border border-[#383838]">
                    {sc.key}
                  </kbd>
                  <span className="text-[#858585] text-right flex-1 ml-4 text-[11px]">
                    {sc.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-4 py-2.5 border-t flex justify-end ${
            isTurboTheme ? 'bg-[#000077] border-turbo-cyan/30' : 'bg-[#1f1f1f] border-[#2b2b2b]'
          }`}
        >
          <button
            type="button"
            onClick={() => setShowShortcutsModal(false)}
            className="win-btn win-btn-accent px-4 py-1"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
