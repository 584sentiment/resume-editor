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
  const [panelPos, setPanelPos] = useState({ x: 0, y: 0 });
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

    // 更新元素位置（用于气泡和面板定位）
    function updateElementPosition(element: AnyElement) {
      const isText = AIAssistant.isTextElement(element);
      if (!canvasWrapperRef.current) return;

      const rect = canvasWrapperRef.current.getBoundingClientRect();
      const currentZoom = manager.getZoom();

      const worldBox = element.worldBox || element.boxBounds || {};
      const centerX = rect.left + ((worldBox.x || element.x || 0) + (worldBox.width || element.width || 100) / 2) * currentZoom;
      const topY = rect.top + (worldBox.y || element.y || 0) * currentZoom;

      if (isText) {
        setBubblePos({
          x: Math.max(10, Math.min(centerX - 100, window.innerWidth - 220)),
          y: Math.max(10, topY - 55),
        });
      }

      setPanelPos({
        x: rect.left + ((worldBox.x || element.x || 0) + (worldBox.width || element.width || 100)) * currentZoom + 16,
        y: topY,
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

  const handleZoomIn = useCallback(() => managerRef.current?.zoomIn(), []);
  const handleZoomOut = useCallback(() => managerRef.current?.zoomOut(), []);
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
        position={panelPos}
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
