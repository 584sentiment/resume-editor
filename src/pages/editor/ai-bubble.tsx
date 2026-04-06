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
        position: 'fixed',
        left: position.x,
        top: position.y,
      }}
    >
      <button className="ai-action-btn" id="ai-rewrite-btn" onClick={onRewrite} title="AI 重写">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
        </svg>
      </button>
      <button className="ai-action-btn" id="ai-optimize-btn" onClick={onOptimize} title="AI 优化">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </button>
    </div>
  );
}
