import { useState, useRef, useEffect } from 'react';
import type { ResumeTemplate } from '../../types/index.js';

export type ExportFormat = 'json' | 'png' | 'jpg' | 'pdf';

interface TopbarProps {
  templates: ResumeTemplate[];
  currentIndex: number;
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  bgLocked: boolean;
  onBack: () => void;
  onTemplateSwitch: (index: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleBgLock: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onExport: (format: ExportFormat) => void;
}

export function Topbar({
  templates,
  currentIndex,
  zoom,
  canUndo,
  canRedo,
  bgLocked,
  onBack,
  onTemplateSwitch,
  onUndo,
  onRedo,
  onToggleBgLock,
  onZoomIn,
  onZoomOut,
  onResetView,
  onExport,
}: TopbarProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭导出菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  const handleExportClick = () => {
    setShowExportMenu(!showExportMenu);
  };

  const handleExportFormat = (format: ExportFormat) => {
    setShowExportMenu(false);
    onExport(format);
  };

  const exportOptions: { format: ExportFormat; label: string; icon: string }[] = [
    { format: 'json', label: 'JSON (设计文件)', icon: 'M4 4h16v16H4z' },
    { format: 'png', label: 'PNG (高清图片)', icon: 'M4 4h16v16H4zM4 8h16M8 4v16' },
    { format: 'jpg', label: 'JPG (普通图片)', icon: 'M4 4h16v16H4z' },
    { format: 'pdf', label: 'PDF (简历文档)', icon: 'M4 4h16v16H4zM14 4v8h4' },
  ];

  return (
    <div className="editor-topbar">
      <div className="editor-topbar-left">
        <button className="btn btn-ghost btn-icon" id="editor-back-btn" title="返回首页" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="editor-brand">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#2563EB" />
            <path d="M8 10h6v12H8V10zm10 0h6v8h-6v-10z" fill="#fff" opacity="0.9" />
          </svg>
          <span>ResumeCraft</span>
        </div>
      </div>
      <div className="editor-topbar-center">
        <div className="editor-template-switcher">
          {templates.map((t, i) => (
            <button
              key={t.id}
              className={`template-dot${i === currentIndex ? ' active' : ''}`}
              title={t.name}
              style={{ '--dot-color': t.color } as React.CSSProperties}
              onClick={() => onTemplateSwitch(i)}
            />
          ))}
        </div>
      </div>
      <div className="editor-topbar-right">
        <div className="history-controls">
          <button className="btn btn-ghost btn-icon btn-sm" id="undo-btn" title="撤销 (Ctrl+Z)" disabled={!canUndo} onClick={onUndo}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6.69 3L3 13" />
            </svg>
          </button>
          <button className="btn btn-ghost btn-icon btn-sm" id="redo-btn" title="重做 (Ctrl+Shift+Z)" disabled={!canRedo} onClick={onRedo}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 7v6h-6" />
              <path d="M3 17a9 9 0 019-9 9 9 0 016.69 3L21 13" />
            </svg>
          </button>
        </div>
        <button
          className={`btn btn-ghost btn-icon btn-sm ${bgLocked ? '' : 'active'}`}
          title={bgLocked ? '解锁背景（解锁后可选中调整背景矩形）' : '锁定背景（锁定后框选不会选中背景）'}
          onClick={onToggleBgLock}
          style={{ color: bgLocked ? undefined : '#2563EB' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {bgLocked ? (
              <>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </>
            ) : (
              <>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 019.9-1" />
              </>
            )}
          </svg>
        </button>
        <div className="zoom-controls">
          <button className="btn btn-ghost btn-icon btn-sm" id="zoom-out-btn" title="缩小" onClick={onZoomOut}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <span className="zoom-value" id="zoom-value">{Math.round(zoom * 100)}%</span>
          <button className="btn btn-ghost btn-icon btn-sm" id="zoom-in-btn" title="放大" onClick={onZoomIn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button className="btn btn-ghost btn-icon btn-sm" id="zoom-fit-btn" title="适应窗口" onClick={onResetView}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
            </svg>
          </button>
        </div>
        <div className="export-dropdown" ref={exportMenuRef}>
          <button className="btn btn-primary btn-sm" id="export-btn" onClick={handleExportClick}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            导出
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {showExportMenu && (
            <div className="export-menu">
              {exportOptions.map(opt => (
                <button
                  key={opt.format}
                  className="export-menu-item"
                  onClick={() => handleExportFormat(opt.format)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={opt.icon} />
                  </svg>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
