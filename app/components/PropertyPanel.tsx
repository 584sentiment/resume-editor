'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

interface PropertyPanelProps {
  element: AnyElement | null;
  onPropertyChange: (key: string, value: unknown) => void;
  onDelete: () => void;
  onDeselect: () => void;
  onGroup: () => void;
  onUngroup: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
}

const PRESET_COLORS = [
  '#1E293B', '#475569', '#94A3B8',
  '#EF4444', '#F97316', '#FBBF24',
  '#22C55E', '#14B8A6', '#3B82F6',
  '#8B5CF6', '#EC4899', '#FFFFFF',
];

/** 将 rgba/rgb 颜色转换为十六进制格式（用于 color input） */
function toHexColor(color: string): string {
  if (!color || color === 'none') return '#ffffff';
  // 已经是十六进制
  if (color.startsWith('#')) return color;
  // rgba/rgb 格式转换
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  return '#ffffff';
}

export function PropertyPanel({ element, onPropertyChange, onDelete, onDeselect, onGroup, onUngroup, onBringToFront, onSendToBack }: PropertyPanelProps) {
  const [fill, setFill] = useState('#3B82F6');
  const [stroke, setStroke] = useState('');
  const [opacity, setOpacity] = useState(1);
  const [cornerRadius, setCornerRadius] = useState(0);

  // 拖拽状态 - 初始位置在右上角
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const initialized = useRef(false);

  // 从选中元素读取当前属性
  useEffect(() => {
    if (element) {
      setFill(typeof element.fill === 'string' ? element.fill : '#3B82F6');
      setStroke(typeof element.stroke === 'string' ? element.stroke : '');
      setOpacity(element.opacity ?? 1);
      setCornerRadius(element.cornerRadius ?? 0);
    }
  }, [element]);

  // 初始化位置为右上角
  useEffect(() => {
    if (!initialized.current && element) {
      const panelWidth = 288; // w-64 = 256px
      const panelHeight = 400; // 估计高度
      setPos({
        x: window.innerWidth - panelWidth - 16,
        y: 96, // 56px topbar + 14px
      });
      initialized.current = true;
    }
  }, [element]);

  // 拖拽事件
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 只允许通过 header 拖拽
    if ((e.target as HTMLElement).closest('.property-panel-header')) {
      dragging.current = true;
      offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    }
  }, [pos]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({
        x: Math.max(0, Math.min(e.clientX - offset.current.x, window.innerWidth - 260)),
        y: Math.max(0, Math.min(e.clientY - offset.current.y, window.innerHeight - 100)),
      });
    };
    const handleUp = () => {
      dragging.current = false;
    };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, []);

  const handleFillChange = useCallback((color: string) => {
    setFill(color);
    onPropertyChange('fill', color);
  }, [onPropertyChange]);

  const handleStrokeChange = useCallback((color: string) => {
    setStroke(color);
    onPropertyChange('stroke', color || undefined);
  }, [onPropertyChange]);

  const handleOpacityChange = useCallback((value: number) => {
    setOpacity(value);
    onPropertyChange('opacity', value);
  }, [onPropertyChange]);

  const handleCornerRadiusChange = useCallback((value: number) => {
    setCornerRadius(value);
    onPropertyChange('cornerRadius', value);
  }, [onPropertyChange]);

  if (!element) return null;

  const tag = element.tag || '';
  const isText = tag === 'Text';
  const isShape = !isText;

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    left: pos.x,
    top: pos.y,
  };

  return (
    <div className="w-72 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden" style={panelStyle} onMouseDown={handleMouseDown}>
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200 cursor-move property-panel-header">
        <span className="text-sm font-medium text-slate-700 property-panel-title">
          {isText ? '文字属性' : `${tag} 属性`}
        </span>
        <div className="flex items-center gap-1 property-panel-actions">
          {/* 层级操作 */}
          <button className="p-1.5 hover:bg-slate-200 rounded transition-colors text-slate-500 hover:text-slate-700 property-btn-icon" title="置顶" onClick={onBringToFront}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 11 12 6 7 11" />
              <polyline points="17 18 12 13 7 18" />
            </svg>
          </button>
          <button className="p-1.5 hover:bg-slate-200 rounded transition-colors text-slate-500 hover:text-slate-700 property-btn-icon" title="置底" onClick={onSendToBack}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="7 13 12 18 17 13" />
              <polyline points="7 6 12 11 17 6" />
            </svg>
          </button>

          {/* 编组操作 */}
          <button className="p-1.5 hover:bg-slate-200 rounded transition-colors text-slate-500 hover:text-slate-700 property-btn-icon" title="编组" onClick={onGroup}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="8" height="8" rx="1" />
              <rect x="14" y="2" width="8" height="8" rx="1" />
              <rect x="2" y="14" width="8" height="8" rx="1" />
              <rect x="14" y="14" width="8" height="8" rx="1" />
            </svg>
          </button>
          <button className="p-1.5 hover:bg-slate-200 rounded transition-colors text-slate-500 hover:text-slate-700 property-btn-icon" title="解组" onClick={onUngroup}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="8" height="8" rx="1" />
              <rect x="14" y="2" width="8" height="8" rx="1" />
              <rect x="2" y="14" width="8" height="8" rx="1" />
              <rect x="14" y="14" width="8" height="8" rx="1" />
              <line x1="10" y1="10" x2="14" y2="14" />
              <line x1="14" y1="10" x2="10" y2="14" />
            </svg>
          </button>

          <button className="p-1.5 hover:bg-slate-200 rounded transition-colors text-slate-500 hover:text-slate-700 property-btn-icon" title="删除" onClick={onDelete}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
          <button className="p-1.5 hover:bg-slate-200 rounded transition-colors text-slate-500 hover:text-slate-700 property-btn-icon" title="关闭" onClick={onDeselect}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-3 space-y-4 property-panel-body">
        {/* 填充颜色 */}
        {!isText && (
          <div className="space-y-2 property-group">
            <label className="text-xs font-medium text-slate-500 uppercase property-label">填充颜色</label>
            <div className="flex items-center gap-2 property-color-row">
              <input
                type="color"
                className="w-8 h-8 rounded cursor-pointer border-0 property-color-input"
                value={toHexColor(fill)}
                onChange={(e) => handleFillChange(e.target.value)}
              />
              <input
                type="text"
                className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/50 property-text-input"
                value={fill}
                onChange={(e) => handleFillChange(e.target.value)}
                placeholder="#3B82F6"
              />
            </div>
            <div className="flex flex-wrap gap-1 mt-2 property-color-presets">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className={`w-5 h-5 rounded border border-white shadow-sm hover:scale-110 transition-transform color-preset ${fill === color ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                  style={{ background: color }}
                  onClick={() => handleFillChange(color)}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}

        {/* 文字颜色 */}
        {isText && (
          <div className="space-y-2 property-group">
            <label className="text-xs font-medium text-slate-500 uppercase property-label">文字颜色</label>
            <div className="flex items-center gap-2 property-color-row">
              <input
                type="color"
                className="w-8 h-8 rounded cursor-pointer border-0 property-color-input"
                value={toHexColor(fill)}
                onChange={(e) => handleFillChange(e.target.value)}
              />
              <input
                type="text"
                className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/50 property-text-input"
                value={fill}
                onChange={(e) => handleFillChange(e.target.value)}
                placeholder="#1E293B"
              />
            </div>
            <div className="flex flex-wrap gap-1 mt-2 property-color-presets">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className={`w-5 h-5 rounded border border-white shadow-sm hover:scale-110 transition-transform color-preset ${fill === color ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                  style={{ background: color }}
                  onClick={() => handleFillChange(color)}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}

        {/* 描边颜色 */}
        <div className="space-y-2 property-group">
          <label className="text-xs font-medium text-slate-500 uppercase property-label">描边颜色</label>
          <div className="flex items-center gap-2 property-color-row">
            <input
              type="color"
              className="w-8 h-8 rounded cursor-pointer border-0 property-color-input"
              value={toHexColor(stroke) || '#000000'}
              onChange={(e) => handleStrokeChange(e.target.value)}
            />
            <input
              type="text"
              className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/50 property-text-input"
              value={stroke}
              onChange={(e) => handleStrokeChange(e.target.value)}
              placeholder="无描边"
            />
            {stroke && (
              <button
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 property-btn-clear"
                onClick={() => handleStrokeChange('')}
                title="清除描边"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* 透明度 */}
        <div className="space-y-2 property-group">
          <label className="text-xs font-medium text-slate-500 uppercase property-label">
            透明度 <span className="text-slate-700 font-normal property-value">{Math.round(opacity * 100)}%</span>
          </label>
          <input
            type="range"
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500 property-range"
            min="0"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
          />
        </div>

        {/* 圆角 */}
        {isShape && (tag === 'Rect') && (
          <div className="space-y-2 property-group">
            <label className="text-xs font-medium text-slate-500 uppercase property-label">
              圆角 <span className="text-slate-700 font-normal property-value">{cornerRadius}px</span>
            </label>
            <input
              type="range"
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500 property-range"
              min="0"
              max="100"
              step="1"
              value={cornerRadius}
              onChange={(e) => handleCornerRadiusChange(parseInt(e.target.value))}
            />
          </div>
        )}

        {/* 位置信息（只读） */}
        <div className="bg-slate-50 rounded p-2 space-y-2 property-group property-group-readonly">
          <label className="text-xs font-medium text-slate-500 uppercase property-label">位置</label>
          <div className="flex justify-between text-xs text-slate-500 property-info-row">
            <span>X: {Math.round(element.x || 0)}</span>
            <span>Y: {Math.round(element.y || 0)}</span>
          </div>
          {element.width !== undefined && (
            <div className="flex justify-between text-xs text-slate-500 property-info-row">
              <span>W: {Math.round(element.width)}</span>
              <span>H: {Math.round(element.height || 0)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
