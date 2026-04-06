import { createElement, Fragment } from '../../jsx/index.js';
import type { ResumeTemplate } from '../../types/index.js';
import { CANVAS } from '../../constants/index.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyInstance = any;

/** 渲染全屏预览弹窗 */
export function renderPreviewModal(): Element {
  return (
    <div className="fullscreen-modal" id="fullscreen-modal">
      <div className="fullscreen-backdrop" id="fullscreen-backdrop" />
      <div className="fullscreen-content">
        <div className="fullscreen-header">
          <h3 id="fullscreen-title">模板预览</h3>
          <div className="fullscreen-actions">
            <button className="btn btn-primary" id="fullscreen-edit-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              进入编辑器
            </button>
            <button className="btn btn-ghost" id="fullscreen-close-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <div className="fullscreen-canvas" id="fullscreen-canvas" />
      </div>
    </div>
  );
}

/** 在全屏弹窗中渲染模板预览 */
export async function renderFullscreenPreview(
  canvasEl: HTMLElement,
  template: ResumeTemplate,
): Promise<void> {
  const { Leafer } = await import('leafer-ui');
  const { createTemplateContent } = await import('../../templates/index.js');

  // 清理旧实例
  if ((canvasEl as AnyInstance)._leafer) {
    (canvasEl as AnyInstance)._leafer.destroy();
  }

  const rect = canvasEl.getBoundingClientRect();
  const leafer = new Leafer({
    view: canvasEl,
    width: rect.width || 800,
    height: rect.height || 600,
    fill: '#F1F5F9',
  });

  const content = createTemplateContent(template);
  const scale = Math.min(
    (rect.width - 80) / CANVAS.RESUME_WIDTH,
    (rect.height - 80) / CANVAS.RESUME_HEIGHT,
    1,
  );

  leafer.add({
    tag: 'Group',
    x: (rect.width - CANVAS.RESUME_WIDTH * scale) / 2,
    y: (rect.height - CANVAS.RESUME_HEIGHT * scale) / 2,
    scaleX: scale,
    scaleY: scale,
    children: content,
  });

  (canvasEl as AnyInstance)._leafer = leafer;
}

/** 清理全屏预览 */
export function cleanupPreview(canvasEl: HTMLElement): void {
  if ((canvasEl as AnyInstance)._leafer) {
    (canvasEl as AnyInstance)._leafer.destroy();
    (canvasEl as AnyInstance)._leafer = null;
  }
  canvasEl.innerHTML = '';
}
