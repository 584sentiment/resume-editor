import type { ResumeTemplate } from '../../types/index.js';

interface TopbarProps {
  templates: ResumeTemplate[];
  currentIndex: number;
  zoom: number;
  onBack: () => void;
  onTemplateSwitch: (index: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onExport: () => void;
}

export function Topbar({
  templates,
  currentIndex,
  zoom,
  onBack,
  onTemplateSwitch,
  onZoomIn,
  onZoomOut,
  onResetView,
  onExport,
}: TopbarProps) {
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
        <button className="btn btn-primary btn-sm" id="export-btn" onClick={onExport}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          导出
        </button>
      </div>
    </div>
  );
}
