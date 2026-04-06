import { createElement, Fragment } from '../../jsx/index.js';
import { geometryShapes, decorationShapes, resumeShapes } from '../../shapes/index.js';

/** 渲染浮动工具栏 */
export function renderToolbar(): Element {
  return (
    <div className="editor-toolbar" id="editor-toolbar">
      <div className="toolbar-section">
        <div className="toolbar-label">几何图形</div>
        <div className="toolbar-shapes" id="geometry-shapes">
          {renderShapeButtons(geometryShapes)}
        </div>
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-section">
        <div className="toolbar-label">装饰元素</div>
        <div className="toolbar-shapes" id="decoration-shapes">
          {renderShapeButtons(decorationShapes)}
        </div>
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-section">
        <div className="toolbar-label">简历组件</div>
        <div className="toolbar-shapes" id="resume-shapes">
          {renderShapeButtons(resumeShapes)}
        </div>
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-section">
        <div className="toolbar-label">文本</div>
        <div className="toolbar-shapes">
          <button className="toolbar-shape-btn" data-shape-id="text" title="添加文本">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M4 7V4h16v3M9 20h6M12 4v16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/** 渲染图形按钮组 */
function renderShapeButtons(shapes: { id: string; name: string; icon: string }[]): Element[] {
  return shapes.map(s => (
    <button className="toolbar-shape-btn" data-shape-id={s.id} title={s.name}>
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path d={s.icon} fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  ));
}
