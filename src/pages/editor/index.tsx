import { useState, useEffect, useRef, useCallback } from 'react';
import { templates } from '../../templates/index.js';
import { CanvasManager } from '../../canvas/manager.js';
import { AIAssistant } from '../../ai/assistant.js';
import { showToast } from '../../utils/ui.js';
import { Topbar } from './topbar.js';
import { Toolbar } from './toolbar.js';
import { AIBubble } from './ai-bubble.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

interface EditorPageProps {
  templateIndex?: number;
}

export function EditorPage({ templateIndex = 0 }: EditorPageProps) {
  const [currentIndex, setCurrentIndex] = useState(templateIndex);
  const [zoom, setZoom] = useState(1);
  const [selectedElement, setSelectedElement] = useState<AnyElement | null>(null);
  const [bubblePos, setBubblePos] = useState({ x: 0, y: 0 });

  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<CanvasManager | null>(null);

  // 同步外部传入的 templateIndex
  useEffect(() => {
    setCurrentIndex(templateIndex);
  }, [templateIndex]);

  // 初始化画布
  useEffect(() => {
    if (!canvasRef.current || !canvasWrapperRef.current) return;

    const manager = new CanvasManager();
    manager.init(canvasRef.current, canvasWrapperRef.current);
    manager.loadTemplate(currentIndex);
    managerRef.current = manager;

    return () => {
      manager.destroy();
      managerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 监听选择和缩放事件
  useEffect(() => {
    const manager = managerRef.current;
    if (!manager || !manager.instance) return;
    const leafer = manager.instance;

    const handleSelect = (e: { value: AnyElement }) => {
      const element = e.value;
      if (element && AIAssistant.isTextElement(element)) {
        setSelectedElement(element);
        // 计算气泡位置
        if (canvasWrapperRef.current) {
          const rect = canvasWrapperRef.current.getBoundingClientRect();
          const currentZoom = manager.getZoom();
          const x = rect.left + (element.x || 0) * currentZoom + ((element.width || 100) * currentZoom) / 2;
          const y = rect.top + (element.y || 0) * currentZoom - 50;
          setBubblePos({
            x: Math.max(10, Math.min(x - 100, window.innerWidth - 220)),
            y: Math.max(10, y),
          });
        }
      } else {
        setSelectedElement(null);
      }
    };

    const handleDeselect = () => {
      setSelectedElement(null);
    };

    const handleZoom = (e: { scale?: number }) => {
      setZoom(e.scale || manager.getZoom());
    };

    leafer.on('select', handleSelect);
    leafer.on('deselect', handleDeselect);
    leafer.on('zoom', handleZoom);

    return () => {
      leafer.off('select', handleSelect);
      leafer.off('deselect', handleDeselect);
      leafer.off('zoom', handleZoom);
    };
  }, [currentIndex]); // 切换模板后重新绑定事件

  const handleBack = useCallback(() => {
    managerRef.current?.destroy();
    managerRef.current = null;
    window.location.hash = '#';
  }, []);

  const handleTemplateSwitch = useCallback(async (index: number) => {
    setCurrentIndex(index);
    setSelectedElement(null);
    managerRef.current?.switchTemplate(index);
  }, []);

  const handleZoomIn = useCallback(() => managerRef.current?.zoomIn(), []);
  const handleZoomOut = useCallback(() => managerRef.current?.zoomOut(), []);
  const handleResetView = useCallback(() => {
    managerRef.current?.resetView();
    setZoom(1);
  }, []);

  const handleAddShape = useCallback((shapeId: string) => {
    managerRef.current?.addShape(shapeId);
  }, []);

  const handleExport = useCallback(() => {
    const json = managerRef.current?.toJSON();
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
  }, []);

  const handleAIRewrite = useCallback(() => {
    if (!selectedElement) return;
    const assistant = new AIAssistant();
    const message = assistant.execute(selectedElement, 'rewrite');
    showToast(message);
  }, [selectedElement]);

  const handleAIOptimize = useCallback(() => {
    if (!selectedElement) return;
    const assistant = new AIAssistant();
    const message = assistant.execute(selectedElement, 'optimize');
    showToast(message);
  }, [selectedElement]);

  return (
    <>
      <Topbar
        templates={templates}
        currentIndex={currentIndex}
        zoom={zoom}
        onBack={handleBack}
        onTemplateSwitch={handleTemplateSwitch}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        onExport={handleExport}
      />
      <div className="editor-layout">
        <Toolbar onAddShape={handleAddShape} />
        <div className="editor-canvas-wrapper" id="editor-canvas-wrapper" ref={canvasWrapperRef}>
          <div className="editor-canvas" id="editor-canvas" ref={canvasRef} />
        </div>
      </div>
      <AIBubble
        visible={selectedElement !== null}
        position={bubblePos}
        onRewrite={handleAIRewrite}
        onOptimize={handleAIOptimize}
      />
    </>
  );
}
