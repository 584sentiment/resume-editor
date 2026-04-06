import { useEffect, useRef } from 'react';
import type { ResumeTemplate } from '../../types/index.js';
import { CANVAS } from '../../constants/index.js';

/** 全屏预览弹窗 */
interface PreviewModalProps {
  isOpen: boolean;
  template: ResumeTemplate | null;
  onClose: () => void;
  onEdit: () => void;
}

export function PreviewModal({ isOpen, template, onClose, onEdit }: PreviewModalProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leaferRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen || !template || !canvasRef.current) return;

    let cancelled = false;

    (async () => {
      const { Leafer } = await import('leafer-ui');
      const { createTemplateContent } = await import('../../templates/index.js');
      if (cancelled || !canvasRef.current) return;

      // 清理旧实例
      if (leaferRef.current) {
        leaferRef.current.destroy();
      }

      const rect = canvasRef.current.getBoundingClientRect();
      const leafer = new Leafer({
        view: canvasRef.current,
        width: rect.width || 800,
        height: rect.height || 600,
        fill: '#F1F5F9',
      });

      const content = createTemplateContent(template);
      const scale = Math.min(
        (rect.width - 80) / CANVAS.RESUME_WIDTH,
        (rect.height - 80) / CANVAS.RESUME_HEIGHT,
        1,
      );

      leafer.add({
        tag: 'Group',
        x: (rect.width - CANVAS.RESUME_WIDTH * scale) / 2,
        y: (rect.height - CANVAS.RESUME_HEIGHT * scale) / 2,
        scaleX: scale,
        scaleY: scale,
        children: content,
      });

      leaferRef.current = leafer;
    })();

    return () => {
      cancelled = true;
      if (leaferRef.current) {
        leaferRef.current.destroy();
        leaferRef.current = null;
      }
      if (canvasRef.current) {
        canvasRef.current.innerHTML = '';
      }
    };
  }, [isOpen, template]);

  // Escape 键关闭
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 控制 body 滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !template) return null;

  return (
    <div className="fullscreen-modal active">
      <div className="fullscreen-backdrop" onClick={onClose} />
      <div className="fullscreen-content">
        <div className="fullscreen-header">
          <h3 id="fullscreen-title">{template.name} - 预览</h3>
          <div className="fullscreen-actions">
            <button className="btn btn-primary" onClick={onEdit}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              进入编辑器
            </button>
            <button className="btn btn-ghost" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <div className="fullscreen-canvas" ref={canvasRef} />
      </div>
    </div>
  );
}
