import React, { useState, useRef, useEffect } from 'react';
import { FileItem } from '../../types/ide';
import { useIDEStore } from '../../store/ideStore';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  ExternalLink,
  Copy,
  Image as ImageIcon,
  Check,
  Grid,
} from 'lucide-react';

interface ImageViewerProps {
  file: FileItem;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ file }) => {
  const { theme } = useIDEStore();
  const [zoom, setZoom] = useState(1);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [bgPattern, setBgPattern] = useState<'checker' | 'dark' | 'light'>('checker');
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });

  const isOcalTheme = theme === 'ocal-signature';
  const isTurboTheme = theme === 'turbo-nostalgia';

  const ext = (file.name.includes('.') ? file.name.split('.').pop()?.toUpperCase() : 'IMG') || 'IMG';

  // Handle image load to extract natural dimensions
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
  };

  const handleZoomIn = () => setZoom((z) => Math.min(5, Math.round((z + 0.25) * 100) / 100));
  const handleZoomOut = () => setZoom((z) => Math.max(0.2, Math.round((z - 0.25) * 100) / 100));
  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Drag to pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCopyPath = () => {
    if (file.path) {
      navigator.clipboard.writeText(file.path);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleOpenExternal = () => {
    if (file.path && window.electronAPI) {
      window.electronAPI.openExternalUrl(`file://${file.path}`);
    }
  };

  // Format content source for SVG or Base64 Data URL
  const imageSrc =
    file.content.startsWith('data:')
      ? file.content
      : file.content.startsWith('<svg') || file.content.includes('<svg')
      ? `data:image/svg+xml;utf8,${encodeURIComponent(file.content)}`
      : file.path
      ? `file://${file.path.replace(/\\/g, '/')}`
      : file.content;

  return (
    <div
      className={`flex flex-col h-full w-full select-none overflow-hidden ${
        isOcalTheme ? 'bg-[#0c0c0c]' : 'bg-[#181818]'
      }`}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Image Toolbar */}
      <div
        className={`flex items-center justify-between px-3 py-1.5 border-b text-xs shrink-0 ${
          isOcalTheme
            ? 'bg-[#121318] border-[#252536] text-[#858585]'
            : isTurboTheme
            ? 'bg-[#0000AA] border-[#55FFFF] text-[#55FFFF]'
            : 'bg-[#1f1f1f] border-[#2b2b2b] text-[#858585]'
        }`}
      >
        {/* Left: Image Info */}
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1 font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-400 border border-purple-800/40">
            <ImageIcon className="w-3 h-3" />
            <span>{ext}</span>
          </span>

          <span className="text-[#cccccc] font-medium text-xs truncate max-w-[200px]" title={file.name}>
            {file.name}
          </span>

          {dimensions && (
            <span className="text-[11px] font-mono text-[#858585] hidden sm:inline">
              {dimensions.width} × {dimensions.height} px
            </span>
          )}
        </div>

        {/* Center: Zoom Controls */}
        <div
          className={`flex items-center rounded border p-0.5 ${
            isOcalTheme ? 'bg-[#181920] border-[#252536]' : 'bg-[#141414] border-[#333333]'
          }`}
        >
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1 hover:text-white rounded transition-colors text-[#858585] cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 py-0.5 text-[11px] font-mono text-[#cccccc] hover:text-white cursor-pointer"
            title="Reset Zoom (100%)"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1 hover:text-white rounded transition-colors text-[#858585] cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            className="p-1 hover:text-white rounded transition-colors text-[#858585] cursor-pointer border-l border-[#252536] ml-0.5 pl-1.5"
            title="Reset Position & Zoom"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Right: Background & Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Background Toggle (Checker / Dark / Light) */}
          <button
            type="button"
            onClick={() =>
              setBgPattern((prev) => (prev === 'checker' ? 'dark' : prev === 'dark' ? 'light' : 'checker'))
            }
            className="p-1 hover:text-white rounded transition-colors text-[#858585] cursor-pointer"
            title={`Background: ${bgPattern}`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {file.path && (
            <>
              <button
                type="button"
                onClick={handleCopyPath}
                className="flex items-center gap-1 px-2 py-0.5 rounded hover:text-white transition-colors text-[11px] text-[#858585] cursor-pointer"
                title="Copy Image Path"
              >
                {copied ? <Check className="w-3 h-3 text-[#34d058]" /> : <Copy className="w-3 h-3" />}
                <span className="hidden md:inline">{copied ? 'Copied' : 'Copy Path'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenExternal}
                className="p-1 hover:text-white rounded transition-colors text-[#858585] cursor-pointer"
                title="Open in System Default Viewer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Image Canvas Viewport */}
      <div
        className={`flex-1 w-full h-full overflow-hidden flex items-center justify-center relative cursor-grab active:cursor-grabbing ${
          bgPattern === 'dark'
            ? 'bg-[#0a0a0a]'
            : bgPattern === 'light'
            ? 'bg-[#f8fafc]'
            : 'bg-[radial-gradient(#252536_1px,transparent_1px)] [background-size:16px_16px] bg-[#0c0c0c]'
        }`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className="flex items-center justify-center p-4"
        >
          <img
            src={imageSrc}
            alt={file.name}
            onLoad={handleImageLoad}
            className="max-w-none shadow-2xl rounded-sm pointer-events-none"
            style={{
              imageRendering: zoom > 2 ? 'pixelated' : 'auto',
            }}
          />
        </div>
      </div>
    </div>
  );
};
