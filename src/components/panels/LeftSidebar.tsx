import React, { useState, useRef, useEffect } from 'react';
import { useIDEStore } from '../../store/ideStore';
import { CODE_TEMPLATES } from '../../templates/defaultSnippets';
import { FileTreeNode } from '../../types/ide';
import {
  Plus,
  FolderOpen,
  FolderPlus,
  RotateCw,
  X,
  Search,
  Sparkles,
  Cpu,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ChevronRight,
  ChevronDown,
  Folder,
  FileText,
} from 'lucide-react';

export const LeftSidebar: React.FC = () => {
  const {
    files,
    activeFileId,
    setActiveFileId,
    addNewFile,
    openFileFromDisk,
    closeFile,
    loadTemplate,
    toolchains,
    compilerConfig,
    setCompilerConfig,
    theme,
    sidebarTab,
    sidebarWidth,
    setSidebarWidth,
    diagnostics,
    setCursorPos,
    // Workspace
    workspacePath,
    workspaceName,
    workspaceTree,
    expandedFolders,
    isScanningWorkspace,
    openFolderFromDisk,
    closeWorkspace,
    refreshWorkspace,
    toggleFolderExpand,
    openWorkspaceFile,
    createWorkspaceFile,
    createWorkspaceFolder,
    deleteWorkspaceNode,
  } = useIDEStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [creatingType, setCreatingType] = useState<'file' | 'folder' | null>(null);
  const [creatingParentPath, setCreatingParentPath] = useState<string | null>(null);
  const [creatingItemName, setCreatingItemName] = useState('');
  const isResizingRef = useRef(false);

  const isOcalTheme = theme === 'ocal-signature';
  const isTurboTheme = theme === 'turbo-nostalgia';
  const defaultToolchain = toolchains.find((t) => t.detected) || toolchains[0];

  // Drag to resize sidebar width
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizingRef.current) return;
    const newWidth = Math.max(180, Math.min(e.clientX - 44, 450));
    setSidebarWidth(newWidth);
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleConfirmCreate = async () => {
    if (!creatingItemName.trim() || !creatingParentPath) {
      setCreatingType(null);
      setCreatingParentPath(null);
      setCreatingItemName('');
      return;
    }

    if (creatingType === 'file') {
      await createWorkspaceFile(creatingParentPath, creatingItemName.trim());
    } else if (creatingType === 'folder') {
      await createWorkspaceFolder(creatingParentPath, creatingItemName.trim());
    }

    setCreatingType(null);
    setCreatingParentPath(null);
    setCreatingItemName('');
  };

  const getFileBadge = (name: string, ext?: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.startsWith('.env')) {
      return <span className="text-[9px] font-mono font-bold px-1 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">ENV</span>;
    }
    if (lowerName === '.gitignore' || lowerName === '.gitattributes') {
      return <span className="text-[9px] font-mono font-bold px-1 rounded bg-orange-950/60 text-orange-400 border border-orange-800/40">GIT</span>;
    }

    const fileExt = ext || (name.includes('.') ? `.${name.split('.').pop()?.toLowerCase()}` : '');
    switch (fileExt) {
      case '.cpp':
      case '.cxx':
      case '.hpp':
      case '.h':
        return <span className="text-[9px] font-mono font-bold px-1 rounded bg-blue-950/60 text-blue-400 border border-blue-800/40">CPP</span>;
      case '.c':
        return <span className="text-[9px] font-mono font-bold px-1 rounded bg-indigo-950/60 text-indigo-400 border border-indigo-800/40">C</span>;
      case '.py':
      case '.pyw':
        return <span className="text-[9px] font-mono font-bold px-1 rounded bg-amber-950/60 text-amber-400 border border-amber-800/40">PY</span>;
      case '.java':
        return <span className="text-[9px] font-mono font-bold px-1 rounded bg-orange-950/60 text-orange-400 border border-orange-800/40">JAVA</span>;
      case '.js':
      case '.mjs':
      case '.cjs':
        return <span className="text-[9px] font-mono font-bold px-1 rounded bg-yellow-950/60 text-yellow-400 border border-yellow-800/40">JS</span>;
      case '.ts':
        return <span className="text-[9px] font-mono font-bold px-1 rounded bg-sky-950/60 text-sky-400 border border-sky-800/40">TS</span>;
      case '.tsx':
      case '.jsx':
        return <span className="text-[9px] font-mono font-bold px-1 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">REACT</span>;
      case '.html':
      case '.htm':
        return <span className="text-[9px] font-mono font-bold px-1 rounded bg-rose-950/60 text-rose-400 border border-rose-800/40">HTML</span>;
      case '.css':
      case '.scss':
      case '.less':
        return <span className="text-[9px] font-mono font-bold px-1 rounded bg-teal-950/60 text-teal-400 border border-teal-800/40">CSS</span>;
      case '.json':
        return <span className="text-[9px] font-mono font-bold px-1 rounded bg-neutral-800 text-neutral-300">JSON</span>;
      case '.md':
      case '.markdown':
        return <span className="text-[9px] font-mono font-bold px-1 rounded bg-slate-800 text-slate-300">MD</span>;
      case '.svg':
      case '.png':
      case '.jpg':
      case '.jpeg':
      case '.ico':
        return <span className="text-[9px] font-mono font-bold px-1 rounded bg-purple-950/60 text-purple-400 border border-purple-800/40">IMG</span>;
      case '.sh':
      case '.bat':
      case '.cmd':
      case '.ps1':
        return <span className="text-[9px] font-mono font-bold px-1 rounded bg-lime-950/60 text-lime-400 border border-lime-800/40">SH</span>;
      case '.yml':
      case '.yaml':
        return <span className="text-[9px] font-mono font-bold px-1 rounded bg-red-950/60 text-red-400 border border-red-800/40">YML</span>;
      case '.txt':
      case '.log':
        return <span className="text-[9px] font-mono font-bold px-1 rounded bg-neutral-800 text-neutral-400">TXT</span>;
      default:
        return <FileText className="w-3.5 h-3.5 text-[#858585]" />;
    }
  };

  const renderTreeNode = (node: FileTreeNode, depth = 0) => {
    const isExpanded = !!expandedFolders[node.path];
    const isCreatingUnderThis = creatingParentPath === node.path;
    const isSelected = files.some((f) => f.path === node.path && f.id === activeFileId);

    if (node.isDirectory) {
      return (
        <div key={node.path} className="flex flex-col">
          <div
            onClick={() => toggleFolderExpand(node.path)}
            style={{ paddingLeft: `${depth * 12 + 6}px` }}
            className={`group flex items-center justify-between py-1 pr-2 rounded text-xs cursor-pointer select-none transition-colors ${
              isTurboTheme
                ? 'hover:bg-[#000077] text-[#55FFFF]'
                : isOcalTheme
                ? 'hover:bg-[#181920] text-[#cccccc] hover:text-white'
                : 'hover:bg-[#232323] text-[#cccccc] hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-[#858585] shrink-0" />
              ) : (
                <ChevronRight className="w-3 h-3 text-[#858585] shrink-0" />
              )}
              {isExpanded ? (
                <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : (
                <Folder className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
              )}
              <span className="truncate font-medium text-xs text-[#e8e8e8]">{node.name}</span>
            </div>

            {/* Folder Actions */}
            <div className="hidden group-hover:flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  toggleFolderExpand(node.path);
                  setCreatingParentPath(node.path);
                  setCreatingType('file');
                  setCreatingItemName('');
                }}
                className="p-0.5 hover:text-white hover:bg-[#333333] rounded cursor-pointer"
                title="New File"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleFolderExpand(node.path);
                  setCreatingParentPath(node.path);
                  setCreatingType('folder');
                  setCreatingItemName('');
                }}
                className="p-0.5 hover:text-white hover:bg-[#333333] rounded cursor-pointer"
                title="New Folder"
              >
                <FolderPlus className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete folder "${node.name}" and all its contents?`)) {
                    deleteWorkspaceNode(node.path);
                  }
                }}
                className="p-0.5 hover:text-red-400 hover:bg-[#333333] rounded cursor-pointer"
                title="Delete Folder"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Inline creation input under this folder */}
          {isCreatingUnderThis && (
            <div style={{ paddingLeft: `${(depth + 1) * 12 + 6}px` }} className="py-1 pr-2">
              <input
                autoFocus
                type="text"
                value={creatingItemName}
                placeholder={creatingType === 'file' ? 'filename.ext' : 'folder-name'}
                onChange={(e) => setCreatingItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmCreate();
                  if (e.key === 'Escape') {
                    setCreatingType(null);
                    setCreatingParentPath(null);
                  }
                }}
                onBlur={handleConfirmCreate}
                className="w-full text-xs font-mono px-1.5 py-0.5 bg-[#000000] border border-[#34d058] rounded outline-none text-white shadow-xs"
              />
            </div>
          )}

          {/* Render Children if expanded */}
          {isExpanded && node.children && (
            <div className="flex flex-col">
              {node.children.map((child) => renderTreeNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // Render File
    return (
      <div
        key={node.path}
        onClick={() => openWorkspaceFile(node.path)}
        style={{ paddingLeft: `${depth * 12 + 18}px` }}
        className={`group flex items-center justify-between py-1 pr-2 rounded text-xs cursor-pointer transition-colors ${
          isTurboTheme
            ? isSelected
              ? 'bg-[#000077] text-[#FFFF55] font-bold border border-[#55FFFF]'
              : 'hover:bg-[#000077]/60 text-[#AAAAAA] hover:text-white'
            : isSelected
            ? isOcalTheme
              ? 'bg-[#181920] text-white font-medium border-l-2 border-[#34d058]'
              : 'bg-[#2a2d2e] text-white font-medium border-l-2 border-[#0078d4]'
            : isOcalTheme
            ? 'hover:bg-[#15161e] text-[#cccccc] hover:text-white'
            : 'hover:bg-[#232323] text-[#cccccc] hover:text-white'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {getFileBadge(node.name, node.extension)}
          <span className="truncate font-mono text-xs">{node.name}</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete file "${node.name}"?`)) {
              deleteWorkspaceNode(node.path);
            }
          }}
          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 transition-opacity cursor-pointer"
          title="Delete File"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    );
  };

  const filteredTemplates = CODE_TEMPLATES.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      style={{ width: `${sidebarWidth}px` }}
      className={`h-full flex flex-col border-r select-none shrink-0 relative transition-none ${
        isTurboTheme
          ? 'bg-[#0000AA] border-[#55FFFF] text-white font-dos'
          : isOcalTheme
          ? 'bg-[#0c0c0c] border-[#252536] text-[#e8e8e8] font-sans'
          : 'bg-[#181818] border-[#2b2b2b] text-[#cccccc] font-sans'
      }`}
    >
      {/* ========================================================
          1. EXPLORER TAB (Multi-File & Open Folder Workspace)
         ======================================================== */}
      {sidebarTab === 'explorer' && (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div
            className={`flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wide border-b ${
              isTurboTheme
                ? 'bg-[#000077] border-[#55FFFF] text-[#55FFFF]'
                : isOcalTheme
                ? 'bg-[#121318] border-[#252536] text-[#e8e8e8]'
                : 'bg-[#1f1f1f] border-[#2b2b2b] text-[#858585]'
            }`}
          >
            <span>{isTurboTheme ? '■ Explorer' : 'Explorer'}</span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => addNewFile()}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  isTurboTheme ? 'hover:bg-[#0000AA] text-[#55FFFF] hover:text-[#FFFF55]' : 'hover:text-white hover:bg-[#2e2e2e]'
                }`}
                title="New File (Ctrl+N)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => openFolderFromDisk()}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  isTurboTheme ? 'hover:bg-[#0000AA] text-[#55FFFF] hover:text-[#FFFF55]' : 'hover:text-white hover:bg-[#2e2e2e]'
                }`}
                title="Open Project Folder"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => openFileFromDisk()}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  isTurboTheme ? 'hover:bg-[#0000AA] text-[#55FFFF] hover:text-[#FFFF55]' : 'hover:text-white hover:bg-[#2e2e2e]'
                }`}
                title="Open File (Ctrl+O)"
              >
                <FolderOpen className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col p-1 space-y-2">
            {/* Section A: Open Editors Accordion */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#858585]">
                <span>Open Editors ({files.length})</span>
              </div>
              <div className="space-y-0.5">
                {files.map((file) => {
                  const isActive = file.id === activeFileId;
                  return (
                    <div
                      key={file.id}
                      onClick={() => setActiveFileId(file.id)}
                      className={`group flex items-center justify-between px-2.5 py-1.5 rounded text-xs cursor-pointer transition-colors ${
                        isTurboTheme
                          ? isActive
                            ? 'bg-[#000077] text-[#FFFF55] font-bold border border-[#55FFFF] shadow-inner'
                            : 'text-[#AAAAAA] hover:bg-[#000077]/60 hover:text-white'
                          : isActive
                          ? isOcalTheme
                            ? 'bg-[#181920] text-white font-medium border-l-2 border-[#34d058]'
                            : 'bg-[#2a2d2e] text-white font-medium border-l-2 border-[#0078d4]'
                          : isOcalTheme
                          ? 'text-[#cccccc] hover:bg-[#15161e] hover:text-white'
                          : 'text-[#cccccc] hover:bg-[#232323] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {getFileBadge(file.name)}
                        <span className="truncate font-mono text-xs">{file.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {file.isDirty && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isTurboTheme ? 'bg-[#FFFF55]' : 'bg-[#e8ff47]'
                            }`}
                            title="Unsaved changes"
                          />
                        )}
                        {files.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              closeFile(file.id);
                            }}
                            className={`opacity-0 group-hover:opacity-100 p-0.5 transition-opacity cursor-pointer ${
                              isTurboTheme ? 'text-[#FF5555]' : 'hover:text-[#f14c4c]'
                            }`}
                            title="Close File"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section B: Workspace Directory Tree */}
            <div className="flex flex-col pt-2 border-t border-[#252536]">
              {workspacePath ? (
                <>
                  {/* Workspace Folder Header */}
                  <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#858585]">
                    <div className="flex items-center gap-1 truncate max-w-[150px]">
                      <Folder className="w-3 h-3 text-[#34d058]" />
                      <span className="text-[#e8e8e8] font-bold truncate">{workspaceName}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setCreatingParentPath(workspacePath);
                          setCreatingType('file');
                          setCreatingItemName('');
                        }}
                        className="p-1 hover:text-white hover:bg-[#222222] rounded cursor-pointer"
                        title="New File in Project Root"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCreatingParentPath(workspacePath);
                          setCreatingType('folder');
                          setCreatingItemName('');
                        }}
                        className="p-1 hover:text-white hover:bg-[#222222] rounded cursor-pointer"
                        title="New Folder in Project Root"
                      >
                        <FolderPlus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => refreshWorkspace()}
                        className="p-1 hover:text-white hover:bg-[#222222] rounded cursor-pointer"
                        title="Refresh Workspace"
                      >
                        <RotateCw className={`w-3 h-3 ${isScanningWorkspace ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => closeWorkspace()}
                        className="p-1 hover:text-red-400 hover:bg-[#222222] rounded cursor-pointer"
                        title="Close Project Workspace"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Root inline creation */}
                  {creatingParentPath === workspacePath && (
                    <div className="px-2 py-1">
                      <input
                        autoFocus
                        type="text"
                        value={creatingItemName}
                        placeholder={creatingType === 'file' ? 'filename.ext' : 'folder-name'}
                        onChange={(e) => setCreatingItemName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleConfirmCreate();
                          if (e.key === 'Escape') {
                            setCreatingType(null);
                            setCreatingParentPath(null);
                          }
                        }}
                        onBlur={handleConfirmCreate}
                        className="w-full text-xs font-mono px-1.5 py-0.5 bg-[#000000] border border-[#34d058] rounded outline-none text-white shadow-xs"
                      />
                    </div>
                  )}

                  {/* Render Folder Tree Nodes */}
                  <div className="space-y-0.5 mt-1">
                    {workspaceTree.length > 0 ? (
                      workspaceTree.map((node) => renderTreeNode(node, 0))
                    ) : (
                      <div className="px-3 py-2 text-xs text-[#858585] italic">
                        {isScanningWorkspace ? 'Scanning project folder...' : 'Empty folder'}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* No folder opened state card */
                <div className="flex flex-col items-center justify-center p-4 text-center rounded-lg border border-dashed border-[#252536] bg-[#121318]/40 my-2">
                  <FolderPlus className="w-8 h-8 text-[#34d058] mb-2 opacity-80" />
                  <span className="text-xs font-semibold text-white mb-1">No Folder Opened</span>
                  <p className="text-[11px] text-[#858585] mb-3">
                    Open a project folder to browse full file trees, web assets, and multi-file codebases.
                  </p>
                  <button
                    type="button"
                    onClick={() => openFolderFromDisk()}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-[#34d058] hover:bg-[#2ea043] text-black text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Open Project Folder</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. TEMPLATES TAB
         ======================================================== */}
      {sidebarTab === 'templates' && (
        <div className="flex flex-col h-full overflow-hidden">
          <div
            className={`flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wide border-b ${
              isTurboTheme
                ? 'bg-[#000077] border-[#55FFFF] text-[#55FFFF]'
                : isOcalTheme
                ? 'bg-[#121318] border-[#252536] text-[#e8e8e8]'
                : 'bg-[#1f1f1f] border-[#2b2b2b] text-[#858585]'
            }`}
          >
            <span>Templates</span>
            <Sparkles className="w-3.5 h-3.5 text-[#34d058]" />
          </div>

          <div className="p-2 border-b border-[#252536]">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#181920] border border-[#252536]">
              <Search className="w-3.5 h-3.5 text-[#858585]" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-[#cccccc] placeholder-[#666666] outline-none"
              />
            </div>
          </div>

          <div className="flex-1 p-2 overflow-y-auto space-y-1.5">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => loadTemplate(tmpl.id)}
                className={`p-2.5 rounded border transition-all cursor-pointer ${
                  isTurboTheme
                    ? 'bg-[#000077] border-[#55FFFF] hover:bg-[#0000AA] hover:text-[#FFFF55]'
                    : isOcalTheme
                    ? 'bg-[#121318] border-[#252536] hover:border-[#34d058] hover:bg-[#181920]'
                    : 'bg-[#222222] border-[#2b2b2b] hover:border-[#0078d4] hover:bg-[#282828]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white">{tmpl.title}</span>
                  <span className="text-[9px] font-mono px-1 rounded bg-[#34d058]/20 text-[#34d058] font-bold">
                    {tmpl.language.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-[#858585] line-clamp-2">{tmpl.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          3. PROBLEMS TAB
         ======================================================== */}
      {sidebarTab === 'problems' && (
        <div className="flex flex-col h-full overflow-hidden">
          <div
            className={`flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wide border-b ${
              isTurboTheme
                ? 'bg-[#000077] border-[#55FFFF] text-[#55FFFF]'
                : isOcalTheme
                ? 'bg-[#121318] border-[#252536] text-[#e8e8e8]'
                : 'bg-[#1f1f1f] border-[#2b2b2b] text-[#858585]'
            }`}
          >
            <span>Diagnostics</span>
            <span className="text-xs font-bold font-mono">{diagnostics.length}</span>
          </div>

          <div className="flex-1 p-2 overflow-y-auto space-y-1">
            {diagnostics.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-[#858585] text-xs">
                <CheckCircle2 className="w-8 h-8 text-[#34d058] mb-2" />
                <span>No problems detected in workspace</span>
              </div>
            ) : (
              diagnostics.map((diag) => (
                <div
                  key={diag.id}
                  onClick={() => setCursorPos({ line: diag.line, column: diag.column })}
                  className={`p-2 rounded border text-xs cursor-pointer transition-colors ${
                    diag.severity === 'error'
                      ? 'bg-[#f14c4c]/10 border-[#f14c4c]/40 text-[#f14c4c]'
                      : 'bg-[#cca700]/10 border-[#cca700]/40 text-[#cca700]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {diag.fileName || 'source'} [{diag.line}:{diag.column}]
                    </span>
                  </div>
                  <p className="text-[11px] text-[#cccccc] font-mono leading-tight">{diag.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          4. SETTINGS & COMPILER TAB
         ======================================================== */}
      {sidebarTab === 'settings' && (
        <div className="flex flex-col h-full overflow-hidden">
          <div
            className={`flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wide border-b ${
              isTurboTheme
                ? 'bg-[#000077] border-[#55FFFF] text-[#55FFFF]'
                : isOcalTheme
                ? 'bg-[#121318] border-[#252536] text-[#e8e8e8]'
                : 'bg-[#1f1f1f] border-[#2b2b2b] text-[#858585]'
            }`}
          >
            <span>Toolchain Settings</span>
            <Cpu className="w-3.5 h-3.5 text-[#34d058]" />
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-[#858585] mb-1">
                Detected C/C++ Toolchain
              </label>
              <div className="p-2 rounded bg-[#181920] border border-[#252536] font-mono text-[11px] text-[#cccccc]">
                {defaultToolchain ? (
                  <>
                    <div className="font-bold text-[#34d058]">{defaultToolchain.name}</div>
                    <div className="text-[10px] text-[#858585] truncate">{defaultToolchain.path}</div>
                  </>
                ) : (
                  <span className="text-[#f14c4c]">No GCC detected in path</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#858585] mb-1">
                C++ Language Standard
              </label>
              <select
                value={compilerConfig.standard}
                onChange={(e) => setCompilerConfig({ standard: e.target.value as any })}
                className="w-full p-1.5 rounded bg-[#181920] border border-[#252536] text-[#cccccc] text-xs outline-none"
              >
                <option value="c++23">C++23 (Latest Standard)</option>
                <option value="c++20">C++20 (Modern)</option>
                <option value="c++17">C++17 (Default)</option>
                <option value="c++14">C++14</option>
                <option value="c++11">C++11</option>
                <option value="c17">C17 Standard</option>
                <option value="c11">C11 Standard</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#858585] mb-1">
                Optimization Level
              </label>
              <select
                value={compilerConfig.optimization}
                onChange={(e) => setCompilerConfig({ optimization: e.target.value as any })}
                className="w-full p-1.5 rounded bg-[#181920] border border-[#252536] text-[#cccccc] text-xs outline-none"
              >
                <option value="-O0">-O0 (Debug / No Optimization)</option>
                <option value="-O1">-O1 (Basic Optimization)</option>
                <option value="-O2">-O2 (Recommended Release)</option>
                <option value="-O3">-O3 (Max Performance)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#34d058] transition-colors z-20"
      />
    </aside>
  );
};
