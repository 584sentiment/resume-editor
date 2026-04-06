import { useState, useEffect, useRef, useCallback } from 'react';
import { templates } from '../../templates/index.js';
import { CanvasManager } from '../../canvas/manager.js';
import { AIAssistant } from '../../ai/assistant.js';
import { showToast } from '../../utils/ui.js';
import { Topbar } from './topbar.js';
import { Toolbar } from './toolbar.js';
import { AIBubble } from './ai-bubble.js';
import { PropertyPanel } from './property-panel.js';

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
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<CanvasManager | null>(null);
  const activeToolRef = useRef<string | null>(null);

  // 同步外部传入的 templateIndex
  useEffect(() => {
    setCurrentIndex(templateIndex);
  }, [templateIndex]);

  // 初始化画布 & 绑定事件
  useEffect(() => {
    if (!canvasRef.current || !canvasWrapperRef.current) return;

    const manager = new CanvasManager();
    manager.init(canvasRef.current, canvasWrapperRef.current);
    managerRef.current = manager;

    // 绑定事件
    function bindEvents() {
      const editor = manager.editorInstance;
      const app = manager.instance;
      if (!editor || !app) return;

      const handleSelect = (e: { value: AnyElement }) => {
        const element = e.value;
        console.log('Selected element:', element);
        if (!element) {
          setSelectedElement(null);
          return;
        }

        setSelectedElement(element);
        updateElementPosition(element);
      };

      const handleZoom = (e: { scale?: number }) => {
        setZoom(e.scale || manager.getZoom());
      };

      editor.on('editor.select', handleSelect);
      app.on('zoom', handleZoom);

      return () => {
        editor.off('editor.select', handleSelect);
        app.off('zoom', handleZoom);
      };
    }

    // 更新 AI 浮窗位置（元素上方居中）
    function updateElementPosition(element: AnyElement) {
      if (!canvasWrapperRef.current) return;

      const rect = canvasWrapperRef.current.getBoundingClientRect();
      const tree = manager.treeLayer;
      const currentZoom = tree?.scale || 1;
      const treeX = tree?.x || 0;
      const treeY = tree?.y || 0;

      // 沿父级链累加偏移，得到元素相对于 tree 层的绝对坐标
      let offsetX = 0, offsetY = 0;
      let node = element.parent;
      while (node && node !== tree) {
        offsetX += node.x || 0;
        offsetY += node.y || 0;
        node = node.parent;
      }

      const centerX = rect.left + treeX + (offsetX + element.x + element.width / 2) * currentZoom;
      const topY = rect.top + treeY + (offsetY + element.y) * currentZoom;

      setBubblePos({
        x: Math.max(10, Math.min(centerX - 36, window.innerWidth - 80)),
        y: Math.max(10, topY - 44),
      });
    }

    manager.loadTemplate(currentIndex);
    const cleanup = bindEvents();

    return () => {
      cleanup?.();
      manager.destroy();
      managerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 选择工具
  const handleSelectTool = useCallback((shapeId: string | null) => {
    managerRef.current?.exitDrawMode();
    if (shapeId) {
      setActiveTool(shapeId);
      activeToolRef.current = shapeId;
      managerRef.current?.enterDrawMode(shapeId, () => {
        setActiveTool(null);
        activeToolRef.current = null;
      });
    } else {
      setActiveTool(null);
      activeToolRef.current = null;
    }
  }, []);

  // 取消绘制
  const cancelDrawing = useCallback(() => {
    managerRef.current?.exitDrawMode();
    setActiveTool(null);
    activeToolRef.current = null;
  }, []);

  // Escape 取消绘制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeToolRef.current) {
        cancelDrawing();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [cancelDrawing]);

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

  const handleZoomIn = useCallback(() => {
    managerRef.current?.zoomIn();
    setZoom(managerRef.current?.getZoom() ?? 1);
  }, []);
  const handleZoomOut = useCallback(() => {
    managerRef.current?.zoomOut();
    setZoom(managerRef.current?.getZoom() ?? 1);
  }, []);
  const handleResetView = useCallback(() => {
    managerRef.current?.resetView();
    setZoom(1);
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

  const handlePropertyChange = useCallback((key: string, value: unknown) => {
    managerRef.current?.setElementProperty(key, value);
  }, []);

  const handleDeleteElement = useCallback(() => {
    managerRef.current?.removeSelected();
    setSelectedElement(null);
  }, []);

  const handleDeselect = useCallback(() => {
    managerRef.current?.deselect();
    setSelectedElement(null);
  }, []);

  const handleGroup = useCallback(() => managerRef.current?.groupSelected(), []);
  const handleUngroup = useCallback(() => managerRef.current?.ungroupSelected(), []);
  const handleBringToFront = useCallback(() => managerRef.current?.bringToFront(), []);
  const handleSendToBack = useCallback(() => managerRef.current?.sendToBack(), []);

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
        <Toolbar activeTool={activeTool} onSelectTool={handleSelectTool} />
        <div className="editor-canvas-wrapper" id="editor-canvas-wrapper" ref={canvasWrapperRef}>
          <div className="editor-canvas" id="editor-canvas" ref={canvasRef} />
        </div>
      </div>
      <AIBubble
        visible={selectedElement !== null && AIAssistant.isTextElement(selectedElement)}
        position={bubblePos}
        onRewrite={handleAIRewrite}
        onOptimize={handleAIOptimize}
      />
      <PropertyPanel
        element={selectedElement}
        onPropertyChange={handlePropertyChange}
        onDelete={handleDeleteElement}
        onDeselect={handleDeselect}
        onGroup={handleGroup}
        onUngroup={handleUngroup}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}
      />
    </>
  );
}
