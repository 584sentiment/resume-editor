'use client';

import { useState, useRef, useEffect } from 'react';
import type { ResumeTemplate } from '@/lib/types';

export type ExportFormat = 'json' | 'png' | 'jpg' | 'pdf';

interface TopbarProps {
  templates: ResumeTemplate[];
  currentIndex: number;
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  bgLocked: boolean;
  snapEnabled: boolean;
  onBack: () => void;
  onTemplateSwitch: (index: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleBgLock: () => void;
  onToggleSnap: () => void;
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
  snapEnabled,
  onBack,
  onTemplateSwitch,
  onUndo,
  onRedo,
  onToggleBgLock,
  onToggleSnap,
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
    <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 flex items-center px-4 z-40">
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" id="editor-back-btn" title="返回首页" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#2563EB" />
            <path d="M8 10h6v12H8V10zm10 0h6v8h-6v-10z" fill="#fff" opacity="0.9" />
          </svg>
          <span>ResumeCraft</span>
        </div>
      </div>
      <div className="flex-1 flex justify-center">
        <div className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1.5">
          {templates.map((t, i) => (
            <button
              key={t.id}
              className="w-6 h-6 rounded-full border-2 border-white shadow transition-transform hover:scale-110 relative group"
              style={{ background: t.color }}
              title={t.name}
              onClick={() => onTemplateSwitch(i)}
            >
              {/* 悬浮显示模板名称 */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {t.name}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" id="undo-btn" title="撤销 (Ctrl+Z)" disabled={!canUndo} onClick={onUndo}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6.69 3L3 13" />
            </svg>
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" id="redo-btn" title="重做 (Ctrl+Shift+Z)" disabled={!canRedo} onClick={onRedo}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 7v6h-6" />
              <path d="M3 17a9 9 0 019-9 9 9 0 016.69 3L21 13" />
            </svg>
          </button>
        </div>
        <button
          className={`p-2 hover:bg-slate-100 rounded-lg transition-colors ${bgLocked ? '' : 'active'}`}
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
        <button
          className={`p-2 hover:bg-slate-100 rounded-lg transition-colors ${snapEnabled ? 'text-primary' : 'text-slate-400'}`}
          title={snapEnabled ? '吸附已开启（移动元素时显示对齐辅助线）' : '吸附已关闭'}
          onClick={onToggleSnap}
          style={{ color: snapEnabled ? '#2563EB' : undefined }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
            <circle cx="5" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <line x1="12" y1="6" x2="12" y2="11" />
            <line x1="12" y1="13" x2="12" y2="18" />
            <line x1="6" y1="12" x2="11" y2="12" />
            <line x1="13" y1="12" x2="18" y2="12" />
          </svg>
        </button>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg px-1">
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" id="zoom-out-btn" title="缩小" onClick={onZoomOut}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <span className="text-sm font-medium text-slate-600 min-w-12 text-center" id="zoom-value">{Math.round(zoom * 100)}%</span>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" id="zoom-in-btn" title="放大" onClick={onZoomIn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" id="zoom-fit-btn" title="适应窗口" onClick={onResetView}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
            </svg>
          </button>
        </div>
        <div className="relative" ref={exportMenuRef}>
          <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-sm rounded-lg font-medium hover:bg-primary-hover transition-colors" id="export-btn" onClick={handleExportClick}>
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
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
              {exportOptions.map(opt => (
                <button
                  key={opt.format}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
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
