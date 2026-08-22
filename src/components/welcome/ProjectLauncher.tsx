import React from 'react';
import { useIDEStore } from '../../store/ideStore';
import { CODE_TEMPLATES } from '../../templates/defaultSnippets';
import { LanguageTarget } from '../../types/ide';
import {
  Code2,
  FileCode,
  Globe,
  Layers,
  Terminal,
  Cpu,
  FolderOpen,
  FolderPlus,
  Plus,
  Sparkles,
  FileText,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface ProjectTypeOption {
  id: string;
  title: string;
  category: 'systems' | 'web' | 'scripts' | 'empty';
  language: LanguageTarget;
  fileName: string;
  description: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  templateId?: string;
}

export const ProjectLauncher: React.FC = () => {
  const { addNewFile, loadTemplate, openFileFromDisk, openFolderFromDisk, theme } = useIDEStore();

  const isTurboTheme = theme === 'turbo-nostalgia';

  const projectOptions: ProjectTypeOption[] = [
    // 1. C++
    {
      id: 'cpp-standard',
      title: 'C++ Application',
      category: 'systems',
      language: 'cpp',
      fileName: 'main.cpp',
      description: 'Modern C++20 / C++17 native console application with bundled GCC.',
      badge: 'C++20',
      badgeColor: 'bg-indigo-950/60 text-indigo-400 border-indigo-800/40',
      icon: <Code2 className="w-5 h-5 text-indigo-400" />,
      templateId: 'cpp-interactive-io',
    },
    // 2. C
    {
      id: 'c-standard',
      title: 'C Console Program',
      category: 'systems',
      language: 'c',
      fileName: 'main.c',
      description: 'Classic C11/C17 program with memory pointers and standard I/O.',
      badge: 'C11',
      badgeColor: 'bg-blue-950/60 text-blue-400 border-blue-800/40',
      icon: <Cpu className="w-5 h-5 text-blue-400" />,
      templateId: 'c-classic-io',
    },
    // 3. Python
    {
      id: 'python-standard',
      title: 'Python 3 Script',
      category: 'scripts',
      language: 'python',
      fileName: 'main.py',
      description: 'Real-time interactive Python script with live unbuffered terminal execution.',
      badge: 'Python 3',
      badgeColor: 'bg-amber-950/60 text-amber-400 border-amber-800/40',
      icon: <Terminal className="w-5 h-5 text-amber-400" />,
      templateId: 'python-interactive',
    },
    // 4. Java
    {
      id: 'java-standard',
      title: 'Java Application',
      category: 'systems',
      language: 'java',
      fileName: 'Main.java',
      description: 'Java 11+ application with classes, Scanner standard input, and streams.',
      badge: 'Java 17+',
      badgeColor: 'bg-orange-950/60 text-orange-400 border-orange-800/40',
      icon: <Layers className="w-5 h-5 text-orange-400" />,
      templateId: 'java-application',
    },
    // 5. HTML5 & CSS3 Web Project
    {
      id: 'web-html-css',
      title: 'HTML5 & CSS3 Web Project',
      category: 'web',
      language: 'html',
      fileName: 'index.html',
      description: 'Responsive web application with built-in Live Server & auto-reload preview.',
      badge: 'Live Server',
      badgeColor: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40',
      icon: <Globe className="w-5 h-5 text-emerald-400" />,
      templateId: 'html5-web-app',
    },
    // 6. React
    {
      id: 'react-component',
      title: 'React Web Component',
      category: 'web',
      language: 'react',
      fileName: 'App.tsx',
      description: 'Modern React functional component with useState hooks and TypeScript.',
      badge: 'React 18',
      badgeColor: 'bg-cyan-950/60 text-cyan-400 border-cyan-800/40',
      icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
      templateId: 'react-component',
    },
    // 7. Next.js
    {
      id: 'nextjs-page',
      title: 'Next.js Fullstack Page',
      category: 'web',
      language: 'nextjs',
      fileName: 'page.tsx',
      description: 'Next.js App Router Server Component with dynamic routing.',
      badge: 'Next.js 14',
      badgeColor: 'bg-neutral-800 text-white border-neutral-700',
      icon: <Zap className="w-5 h-5 text-sky-400" />,
      templateId: 'nextjs-page',
    },
    // 8. JavaScript / Node.js
    {
      id: 'js-node',
      title: 'JavaScript (Node.js)',
      category: 'scripts',
      language: 'javascript',
      fileName: 'index.js',
      description: 'Modern ES6+ JavaScript runtime with asynchronous promises and console.',
      badge: 'Node.js',
      badgeColor: 'bg-yellow-950/60 text-yellow-400 border-yellow-800/40',
      icon: <FileCode className="w-5 h-5 text-yellow-400" />,
      templateId: 'js-node-script',
    },
  ];

  const handleSelectProject = (opt: ProjectTypeOption) => {
    if (opt.templateId) {
      loadTemplate(opt.templateId);
    } else {
      addNewFile(opt.fileName, opt.language, '');
    }
  };

  const handleStartBlank = (lang: LanguageTarget) => {
    let ext = '.cpp';
    if (lang === 'c') ext = '.c';
    else if (lang === 'python') ext = '.py';
    else if (lang === 'java') ext = '.java';
    else if (lang === 'javascript') ext = '.js';
    else if (lang === 'typescript') ext = '.ts';
    else if (lang === 'html') ext = '.html';
    else if (lang === 'css') ext = '.css';
    else if (lang === 'react' || lang === 'nextjs') ext = '.tsx';

    const fileName = lang === 'java' ? 'Main.java' : `main${ext}`;
    addNewFile(fileName, lang, '');
  };

  return (
    <div
      className={`h-full w-full overflow-y-auto p-6 md:p-10 flex flex-col items-center justify-center select-none ${
        isTurboTheme
          ? 'bg-[#0000AA] text-white font-dos'
          : 'bg-[#181818] text-[#cccccc] font-sans'
      }`}
    >
      <div className="max-w-4xl w-full space-y-6">
        {/* Welcome Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0078d4]/10 border border-[#0078d4]/30 text-xs text-[#60cdff] font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Select a project type to start coding</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Welcome to Ocal Code
          </h1>
          <p className="text-xs md:text-sm text-[#858585] max-w-lg mx-auto">
            Choose your preferred programming environment or open existing source files from disk.
          </p>
        </div>

        {/* Project Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {projectOptions.map((opt) => (
            <div
              key={opt.id}
              onClick={() => handleSelectProject(opt)}
              className={`group p-4 rounded-lg border cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                isTurboTheme
                  ? 'bg-[#000077] border-[#55FFFF] hover:bg-[#0000AA] hover:border-[#FFFF55]'
                  : 'bg-[#202020] border-[#2e2e2e] hover:bg-[#252525] hover:border-[#0078d4] hover:shadow-lg'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-md ${isTurboTheme ? 'bg-[#000055]' : 'bg-[#181818]'}`}>
                    {opt.icon}
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${opt.badgeColor}`}>
                    {opt.badge}
                  </span>
                </div>

                <h3 className="font-semibold text-sm text-white group-hover:text-[#60cdff] transition-colors">
                  {opt.title}
                </h3>
                <p className="text-[11px] text-[#858585] mt-1 line-clamp-2 leading-relaxed">
                  {opt.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#2c2c2c] flex items-center justify-between text-xs text-[#858585] group-hover:text-white transition-colors">
                <span className="font-mono text-[11px]">{opt.fileName}</span>
                <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform text-[#0078d4]" />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Blank / Open Disk Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div
            onClick={() => openFolderFromDisk()}
            className={`p-3.5 rounded-lg border cursor-pointer transition-colors flex items-center gap-3 ${
              isTurboTheme
                ? 'bg-[#000077] border-[#55FFFF] hover:bg-[#000088]'
                : 'bg-[#1e1e1e] border-[#34d058]/40 hover:border-[#34d058] hover:bg-[#252525]'
            }`}
          >
            <div className="p-2 rounded bg-[#34d058]/20 text-[#34d058]">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Open Project Folder</div>
              <div className="text-[11px] text-[#858585]">Load entire codebase</div>
            </div>
          </div>

          <div
            onClick={() => handleStartBlank('cpp')}
            className={`p-3.5 rounded-lg border cursor-pointer transition-colors flex items-center gap-3 ${
              isTurboTheme
                ? 'bg-[#000077] border-[#55FFFF] hover:bg-[#000088]'
                : 'bg-[#1e1e1e] border-[#2b2b2b] hover:bg-[#252525] hover:border-[#383838]'
            }`}
          >
            <div className="p-2 rounded bg-[#2a2a2a] text-[#cccccc]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Blank C++ File</div>
              <div className="text-[11px] text-[#858585]">Start from clean scratch</div>
            </div>
          </div>

          <div
            onClick={() => handleStartBlank('html')}
            className={`p-3.5 rounded-lg border cursor-pointer transition-colors flex items-center gap-3 ${
              isTurboTheme
                ? 'bg-[#000077] border-[#55FFFF] hover:bg-[#000088]'
                : 'bg-[#1e1e1e] border-[#2b2b2b] hover:bg-[#252525] hover:border-[#383838]'
            }`}
          >
            <div className="p-2 rounded bg-[#2a2a2a] text-[#23d18b]">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Blank Web File</div>
              <div className="text-[11px] text-[#858585]">Empty HTML5 canvas</div>
            </div>
          </div>

          <div
            onClick={openFileFromDisk}
            className={`p-3.5 rounded-lg border cursor-pointer transition-colors flex items-center gap-3 ${
              isTurboTheme
                ? 'bg-[#000077] border-[#55FFFF] hover:bg-[#000088]'
                : 'bg-[#1e1e1e] border-[#2b2b2b] hover:bg-[#252525] hover:border-[#383838]'
            }`}
          >
            <div className="p-2 rounded bg-[#2a2a2a] text-[#0078d4]">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Open Single File</div>
              <div className="text-[11px] text-[#858585]">Load from computer</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
