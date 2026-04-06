import { useState, useEffect, useCallback } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

interface PropertyPanelProps {
  element: AnyElement | null;
  position: { x: number; y: number };
  onPropertyChange: (key: string, value: unknown) => void;
  onDelete: () => void;
  onDeselect: () => void;
}

const PRESET_COLORS = [
  '#1E293B', '#475569', '#94A3B8',
  '#EF4444', '#F97316', '#FBBF24',
  '#22C55E', '#14B8A6', '#3B82F6',
  '#8B5CF6', '#EC4899', '#FFFFFF',
];

export function PropertyPanel({ element, position, onPropertyChange, onDelete, onDeselect }: PropertyPanelProps) {
  const [fill, setFill] = useState('#3B82F6');
  const [stroke, setStroke] = useState('');
  const [opacity, setOpacity] = useState(1);
  const [cornerRadius, setCornerRadius] = useState(0);

  // 从选中元素读取当前属性
  useEffect(() => {
    if (element) {
      setFill(typeof element.fill === 'string' ? element.fill : '#3B82F6');
      setStroke(typeof element.stroke === 'string' ? element.stroke : '');
      setOpacity(element.opacity ?? 1);
      setCornerRadius(element.cornerRadius ?? 0);
    }
  }, [element]);

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

  // 计算面板位置（避免超出屏幕）
  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    left: Math.max(10, Math.min(position.x, window.innerWidth - 260)),
    top: Math.max(10, Math.min(position.y, window.innerHeight - 400)),
  };

  return (
    <div className="property-panel" style={panelStyle}>
      <div className="property-panel-header">
        <span className="property-panel-title">
          {isText ? '文字属性' : `${tag} 属性`}
        </span>
        <div className="property-panel-actions">
          <button className="property-btn-icon" title="删除" onClick={onDelete}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
          <button className="property-btn-icon" title="关闭" onClick={onDeselect}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="property-panel-body">
        {/* 填充颜色 */}
        {!isText && (
          <div className="property-group">
            <label className="property-label">填充颜色</label>
            <div className="property-color-row">
              <input
                type="color"
                className="property-color-input"
                value={fill === 'none' ? '#ffffff' : fill}
                onChange={(e) => handleFillChange(e.target.value)}
              />
              <input
                type="text"
                className="property-text-input"
                value={fill}
                onChange={(e) => handleFillChange(e.target.value)}
                placeholder="#3B82F6"
              />
            </div>
            <div className="property-color-presets">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className={`color-preset ${fill === color ? 'active' : ''}`}
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
          <div className="property-group">
            <label className="property-label">文字颜色</label>
            <div className="property-color-row">
              <input
                type="color"
                className="property-color-input"
                value={fill}
                onChange={(e) => handleFillChange(e.target.value)}
              />
              <input
                type="text"
                className="property-text-input"
                value={fill}
                onChange={(e) => handleFillChange(e.target.value)}
                placeholder="#1E293B"
              />
            </div>
            <div className="property-color-presets">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className={`color-preset ${fill === color ? 'active' : ''}`}
                  style={{ background: color }}
                  onClick={() => handleFillChange(color)}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}

        {/* 描边颜色 */}
        <div className="property-group">
          <label className="property-label">描边颜色</label>
          <div className="property-color-row">
            <input
              type="color"
              className="property-color-input"
              value={stroke || '#000000'}
              onChange={(e) => handleStrokeChange(e.target.value)}
            />
            <input
              type="text"
              className="property-text-input"
              value={stroke}
              onChange={(e) => handleStrokeChange(e.target.value)}
              placeholder="无描边"
            />
            {stroke && (
              <button
                className="property-btn-clear"
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
        <div className="property-group">
          <label className="property-label">
            透明度 <span className="property-value">{Math.round(opacity * 100)}%</span>
          </label>
          <input
            type="range"
            className="property-range"
            min="0"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
          />
        </div>

        {/* 圆角 */}
        {isShape && (tag === 'Rect') && (
          <div className="property-group">
            <label className="property-label">
              圆角 <span className="property-value">{cornerRadius}px</span>
            </label>
            <input
              type="range"
              className="property-range"
              min="0"
              max="100"
              step="1"
              value={cornerRadius}
              onChange={(e) => handleCornerRadiusChange(parseInt(e.target.value))}
            />
          </div>
        )}

        {/* 位置信息（只读） */}
        <div className="property-group property-group-readonly">
          <label className="property-label">位置</label>
          <div className="property-info-row">
            <span>X: {Math.round(element.x || 0)}</span>
            <span>Y: {Math.round(element.y || 0)}</span>
          </div>
          {element.width !== undefined && (
            <div className="property-info-row">
              <span>W: {Math.round(element.width)}</span>
              <span>H: {Math.round(element.height || 0)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
