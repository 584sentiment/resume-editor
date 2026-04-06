import { createElement, Fragment } from '../../jsx/index.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

/** 渲染 AI 气泡 */
export function renderAIBubble(): Element {
  return (
    <div className="ai-bubble" id="ai-bubble" style="display: none;">
      <div className="ai-bubble-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
        <span>AI 助手</span>
      </div>
      <div className="ai-bubble-actions">
        <button className="ai-action-btn" id="ai-rewrite-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
          </svg>
          AI 重写
        </button>
        <button className="ai-action-btn" id="ai-optimize-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          AI 优化
        </button>
      </div>
    </div>
  );
}

/** 显示 AI 气泡并定位到选中元素上方 */
export function showAIBubble(container: HTMLElement, element: AnyElement): void {
  const bubble = container.querySelector('#ai-bubble') as HTMLElement;
  if (!bubble) return;

  bubble.style.display = 'block';

  const canvasWrapper = container.querySelector('#editor-canvas-wrapper') as HTMLElement;
  const wrapperRect = canvasWrapper.getBoundingClientRect();

  const x = wrapperRect.left + (element.x || 0) + (element.width || 100) / 2;
  const y = wrapperRect.top + (element.y || 0) - 60;

  bubble.style.left = `${Math.max(10, Math.min(x - 100, window.innerWidth - 220))}px`;
  bubble.style.top = `${Math.max(10, y)}px`;
  bubble.style.position = 'fixed';

  (bubble as any)._selectedElement = element;
}

/** 隐藏 AI 气泡 */
export function hideAIBubble(container: HTMLElement): void {
  const bubble = container.querySelector('#ai-bubble') as HTMLElement;
  if (bubble) {
    bubble.style.display = 'none';
  }
}

/** 获取当前选中的元素 */
export function getSelectedElement(container: HTMLElement): AnyElement | null {
  const bubble = container.querySelector('#ai-bubble') as HTMLElement;
  return bubble ? (bubble as any)._selectedElement : null;
}
