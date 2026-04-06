interface AIBubbleProps {
  visible: boolean;
  position: { x: number; y: number };
  onRewrite: () => void;
  onOptimize: () => void;
}

export function AIBubble({ visible, position, onRewrite, onOptimize }: AIBubbleProps) {
  if (!visible) return null;

  return (
    <div
      className="ai-bubble"
      style={{
        display: 'flex',
        position: 'fixed',
        left: position.x,
        top: position.y,
      }}
    >
      <div className="ai-bubble-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
        <span>AI 助手</span>
      </div>
      <div className="ai-bubble-actions">
        <button className="ai-action-btn" id="ai-rewrite-btn" onClick={onRewrite}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
          </svg>
          AI 重写
        </button>
        <button className="ai-action-btn" id="ai-optimize-btn" onClick={onOptimize}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          AI 优化
        </button>
      </div>
    </div>
  );
}
