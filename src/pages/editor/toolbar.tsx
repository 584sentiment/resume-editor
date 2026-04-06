import { geometryShapes, decorationShapes, resumeShapes } from '../../shapes/index.js';

interface ToolbarProps {
  onAddShape: (shapeId: string) => void;
}

export function Toolbar({ onAddShape }: ToolbarProps) {
  return (
    <div className="editor-toolbar">
      <div className="toolbar-section">
        <div className="toolbar-label">几何图形</div>
        <div className="toolbar-shapes">
          {geometryShapes.map(s => (
            <button
              key={s.id}
              className="toolbar-shape-btn"
              title={s.name}
              onClick={() => onAddShape(s.id)}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d={s.icon} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-section">
        <div className="toolbar-label">装饰元素</div>
        <div className="toolbar-shapes">
          {decorationShapes.map(s => (
            <button
              key={s.id}
              className="toolbar-shape-btn"
              title={s.name}
              onClick={() => onAddShape(s.id)}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d={s.icon} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-section">
        <div className="toolbar-label">简历组件</div>
        <div className="toolbar-shapes">
          {resumeShapes.map(s => (
            <button
              key={s.id}
              className="toolbar-shape-btn"
              title={s.name}
              onClick={() => onAddShape(s.id)}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d={s.icon} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-section">
        <div className="toolbar-label">文本</div>
        <div className="toolbar-shapes">
          <button
            className="toolbar-shape-btn"
            title="添加文本"
            onClick={() => onAddShape('text')}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M4 7V4h16v3M9 20h6M12 4v16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
