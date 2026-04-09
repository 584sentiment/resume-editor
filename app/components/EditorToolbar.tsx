'use client';

import { useState, useRef } from 'react';
import { geometryShapes, decorationShapes, resumeShapes } from '@/lib/shapes/index';
import type { ShapeItem } from '@/lib/shapes/index';

interface ToolbarProps {
  activeTool: string | null;
  onSelectTool: (shapeId: string | null) => void;
  onImageUpload?: (url: string) => void;
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

export function Toolbar({ activeTool, onSelectTool, onImageUpload }: ToolbarProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      onImageUpload?.(url);
    };
    reader.readAsDataURL(file);

    // 重置 input 以便可以再次选择同一文件
    e.target.value = '';
  };

  return (
    <div className="fixed left-6 w-10 bg-white rounded-lg shadow-lg flex flex-col items-center py-1 gap-1 z-30" style={{ top: 'calc(50vh + 28px)', transform: 'translateY(-50%)' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
        title="上传图片"
        onClick={handleImageUploadClick}
      >
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {categories.map(cat => (
        <div
          key={cat.id}
          className="relative"
          onMouseEnter={() => setHoveredCategory(cat.id)}
          onMouseLeave={() => setHoveredCategory(null)}
        >
          <button
            className={activeTool && cat.shapes.some(s => s.id === activeTool) ? 'w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors' : 'w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-600'}
            title={cat.name}
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d={cat.icon} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {hoveredCategory === cat.id && (
            <div className="absolute left-full ml-0 top-0 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
              <div className="px-3 py-1 text-xs font-medium text-slate-400 uppercase">{cat.name}</div>
              {cat.shapes.map(s => (
                <button
                  key={s.id}
                  className={activeTool === s.id ? 'w-full px-3 py-2 text-left text-sm bg-primary/10 flex items-center gap-2 text-primary' : 'w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-600'}
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
      <div className="w-6 h-px bg-slate-200 my-1" />
      <button
        className={activeTool === 'text' ? 'w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors' : 'w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-600'}
        title="文本"
        onClick={() => onSelectTool('text')}
      >
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d={textToolIcon} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
