import { useState } from 'react';
import { geometryShapes, decorationShapes, resumeShapes } from '../../shapes/index.js';
import type { ShapeItem } from '../../shapes/index.js';

interface ToolbarProps {
  activeTool: string | null;
  onSelectTool: (shapeId: string | null) => void;
}

interface CategoryDef {
  id: string;
  name: string;
  icon: string;
  shapes: ShapeItem[];
}

const categories: CategoryDef[] = [
  {
    id: 'geometry',
    name: '几何图形',
    icon: 'M3 3h18v18H3z',
    shapes: geometryShapes,
  },
  {
    id: 'decoration',
    name: '装饰元素',
    icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    shapes: decorationShapes,
  },
  {
    id: 'resume',
    name: '简历组件',
    icon: 'M4 4h16v16H4zM4 10h16M10 4v16',
    shapes: resumeShapes,
  },
];

const textToolIcon = 'M4 7V4h16v3M9 20h6M12 4v16';

export function Toolbar({ activeTool, onSelectTool }: ToolbarProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <div className="editor-toolbar">
      {categories.map(cat => (
        <div
          key={cat.id}
          className="toolbar-category"
          onMouseEnter={() => setHoveredCategory(cat.id)}
          onMouseLeave={() => setHoveredCategory(null)}
        >
          <button
            className={`toolbar-category-btn ${activeTool && cat.shapes.some(s => s.id === activeTool) ? 'active' : ''}`}
            title={cat.name}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d={cat.icon} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {hoveredCategory === cat.id && (
            <div className="toolbar-flyout">
              <div className="flyout-title">{cat.name}</div>
              {cat.shapes.map(s => (
                <button
                  key={s.id}
                  className={`flyout-item ${activeTool === s.id ? 'active' : ''}`}
                  onClick={() => {
                    onSelectTool(s.id);
                    setHoveredCategory(null);
                  }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d={s.icon} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
      <div className="toolbar-divider" />
      <button
        className={`toolbar-category-btn ${activeTool === 'text' ? 'active' : ''}`}
        title="文本"
        onClick={() => onSelectTool('text')}
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d={textToolIcon} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
