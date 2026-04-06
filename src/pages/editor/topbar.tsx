import { createElement, Fragment } from '../../jsx/index.js';
import type { ResumeTemplate } from '../../types/index.js';

/** 渲染编辑器顶栏 */
export function renderTopbar(templates: ResumeTemplate[], currentIndex: number): Element {
  return (
    <div className="editor-topbar">
      <div className="editor-topbar-left">
        <button className="btn btn-ghost btn-icon" id="editor-back-btn" title="返回首页">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
              className={`template-dot ${i === currentIndex ? 'active' : ''}`}
              data-index={String(i)}
              title={t.name}
              style={`--dot-color: ${t.color}`}
            />
          ))}
        </div>
      </div>
      <div className="editor-topbar-right">
        <div className="zoom-controls">
          <button className="btn btn-ghost btn-icon btn-sm" id="zoom-out-btn" title="缩小">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <span className="zoom-value" id="zoom-value">100%</span>
          <button className="btn btn-ghost btn-icon btn-sm" id="zoom-in-btn" title="放大">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button className="btn btn-ghost btn-icon btn-sm" id="zoom-fit-btn" title="适应窗口">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
            </svg>
          </button>
        </div>
        <button className="btn btn-primary btn-sm" id="export-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

/** 更新缩放显示 */
export function updateZoomDisplay(container: HTMLElement, zoom: number): void {
  const zoomValue = container.querySelector('#zoom-value');
  if (zoomValue) {
    zoomValue.textContent = `${Math.round(zoom * 100)}%`;
  }
}
