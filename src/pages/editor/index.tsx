import { createElement, Fragment } from '../../jsx/index.js';
import { templates } from '../../templates/index.js';
import { CanvasManager } from '../../canvas/manager.js';
import { AIAssistant } from '../../ai/assistant.js';
import { showToast } from '../../utils/ui.js';
import { renderTopbar, updateZoomDisplay } from './topbar.js';
import { renderToolbar } from './toolbar.js';
import { renderAIBubble, showAIBubble, hideAIBubble, getSelectedElement } from './ai-bubble.js';

let canvasManager: CanvasManager | null = null;
let currentTemplateIndex = 0;

export function renderEditorPage(container: HTMLElement, templateIndex?: number): void {
  if (templateIndex !== undefined) {
    currentTemplateIndex = templateIndex;
  }

  const root = (
    <>
      {renderTopbar(templates, currentTemplateIndex)}
      <div className="editor-layout">
        {renderToolbar()}
        <div className="editor-canvas-wrapper" id="editor-canvas-wrapper">
          <div className="editor-canvas" id="editor-canvas" />
        </div>
      </div>
      {renderAIBubble()}
    </>
  );

  container.innerHTML = '';
  container.appendChild(root);

  bindEvents(container);
  initCanvas(container);
}

/** 初始化画布并加载模板 */
async function initCanvas(container: HTMLElement): Promise<void> {
  canvasManager = new CanvasManager();
  await canvasManager.init(container);
  canvasManager.loadTemplate(currentTemplateIndex);

  // 选择事件 -> AI 气泡
  canvasManager.onSelect((element) => {
    if (element && AIAssistant.isTextElement(element)) {
      showAIBubble(container, element);
    } else {
      hideAIBubble(container);
    }
  });

  // 缩放事件 -> 更新显示
  canvasManager.onZoom((zoom) => {
    updateZoomDisplay(container, zoom);
  });
}

/** 绑定所有 UI 事件 */
function bindEvents(container: HTMLElement): void {
  // 返回首页
  container.querySelector('#editor-back-btn')?.addEventListener('click', () => {
    canvasManager?.destroy();
    canvasManager = null;
    window.location.hash = '#';
  });

  // 模板切换
  container.querySelectorAll('.template-dot').forEach(dot => {
    dot.addEventListener('click', async (e) => {
      const index = parseInt((e.currentTarget as HTMLElement).dataset.index || '0');
      currentTemplateIndex = index;
      container.querySelectorAll('.template-dot').forEach((d, i) => {
        d.classList.toggle('active', i === index);
      });
      await canvasManager?.switchTemplate(index);
    });
  });

  // 缩放控制
  container.querySelector('#zoom-in-btn')?.addEventListener('click', () => canvasManager?.zoomIn());
  container.querySelector('#zoom-out-btn')?.addEventListener('click', () => canvasManager?.zoomOut());
  container.querySelector('#zoom-fit-btn')?.addEventListener('click', () => {
    canvasManager?.resetView();
    updateZoomDisplay(container, 1);
  });

  // 添加图形
  container.querySelectorAll('.toolbar-shape-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const shapeId = (e.currentTarget as HTMLElement).dataset.shapeId;
      if (shapeId && canvasManager) {
        canvasManager.addShape(shapeId);
      }
    });
  });

  // AI 操作
  container.querySelector('#ai-rewrite-btn')?.addEventListener('click', () => {
    handleAIAction(container, 'rewrite');
  });
  container.querySelector('#ai-optimize-btn')?.addEventListener('click', () => {
    handleAIAction(container, 'optimize');
  });

  // 导出
  container.querySelector('#export-btn')?.addEventListener('click', () => handleExport(container));
}

/** 处理 AI 操作 */
function handleAIAction(container: HTMLElement, action: 'rewrite' | 'optimize'): void {
  const element = getSelectedElement(container);
  if (!element) return;

  const assistant = new AIAssistant();
  const message = assistant.execute(element, action);
  showToast(message);
}

/** 处理导出 */
function handleExport(container: HTMLElement): void {
  const json = canvasManager?.toJSON();
  if (!json) {
    showToast('导出失败，请重试');
    return;
  }

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'resume-design.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('设计文件已导出');
}
