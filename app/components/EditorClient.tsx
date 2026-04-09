'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { templates } from '@/lib/templates/index';
import { CanvasManager } from '@/lib/canvas/manager';
import { AIAssistant } from '@/lib/ai/assistant';
import { showToast } from '@/lib/utils/ui';
import { Topbar } from './EditorTopbar';
import { Toolbar } from './EditorToolbar';
import { AIBubble } from './AIBubble';
import { PropertyPanel } from './PropertyPanel';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

interface EditorPageProps {
  templateIndex?: number;
}

export function EditorPage({ templateIndex = 0 }: EditorPageProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(templateIndex);
  const [zoom, setZoom] = useState(1);
  const [selectedElement, setSelectedElement] = useState<AnyElement | null>(null);
  const [bubblePos, setBubblePos] = useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [bgLocked, setBgLocked] = useState(true);

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
        // 处理空值、空数组、编辑器内部对象等情况
        if (!element || (Array.isArray(element) && element.length === 0)) {
          setSelectedElement(null);
          return;
        }
        // 如果是数组（多选），取第一个元素
        if (Array.isArray(element)) {
          setSelectedElement(element[0]);
          updateElementPosition(element[0]);
          return;
        }
        // 忽略没有 tag 属性的内部对象（如框选时的临时对象）
        if (!element.tag) {
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

      // 监听历史变化，同步 canUndo/canRedo 状态
      const cleanupHistory = manager.onHistoryChange(() => {
        setCanUndo(manager.canUndo());
        setCanRedo(manager.canRedo());
      });

      return () => {
        editor.off('editor.select', handleSelect);
        app.off('zoom', handleZoom);
        cleanupHistory();
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
    router.push('/');
  }, [router]);

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

  const handleExport = useCallback(async (format: 'json' | 'png' | 'jpg' | 'pdf') => {
    const manager = managerRef.current;
    if (!manager) {
      showToast('导出失败，画布未初始化');
      return;
    }

    try {
      let blob: Blob | null = null;
      let filename = '';
      let mimeType = '';

      switch (format) {
        case 'json': {
          const json = manager.toJSON();
          if (!json) throw new Error('JSON 导出失败');
          blob = new Blob([json], { type: 'application/json' });
          filename = 'resume-design.json';
          mimeType = 'application/json';
          break;
        }
        case 'png': {
          blob = await manager.exportImage('png');
          filename = 'resume-design.png';
          mimeType = 'image/png';
          break;
        }
        case 'jpg': {
          blob = await manager.exportImage('jpg');
          filename = 'resume-design.jpg';
          mimeType = 'image/jpeg';
          break;
        }
        case 'pdf': {
          blob = await manager.exportPDF();
          filename = 'resume-design.pdf';
          mimeType = 'application/pdf';
          break;
        }
      }

      if (!blob) {
        showToast('导出失败，请重试');
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      const formatNames = { json: '设计文件', png: 'PNG 图片', jpg: 'JPG 图片', pdf: 'PDF 文档' };
      showToast(`${formatNames[format]}已导出`);
    } catch (err) {
      console.error('[EditorPage] export error:', err);
      showToast('导出失败，请重试');
    }
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

  const handleUndo = useCallback(() => {
    const mgr = managerRef.current;
    if (!mgr) return;
    mgr.undo();
    mgr.deselect();
    setSelectedElement(null);
    setCanUndo(mgr.canUndo());
    setCanRedo(mgr.canRedo());
  }, []);

  const handleRedo = useCallback(() => {
    const mgr = managerRef.current;
    if (!mgr) return;
    mgr.redo();
    mgr.deselect();
    setSelectedElement(null);
    setCanUndo(mgr.canUndo());
    setCanRedo(mgr.canRedo());
  }, []);

  // 撤销/重做快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

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

  const handleToggleBgLock = useCallback(() => {
    const mgr = managerRef.current;
    if (!mgr) return;
    const locked = mgr.toggleBackgroundsLock();
    setBgLocked(locked);
    showToast(locked ? '背景已锁定' : '背景已解锁，可选中调整');
  }, []);

  const handleImageUpload = useCallback((url: string) => {
    managerRef.current?.addImage(url);
    showToast('图片已添加，双击可裁剪');
  }, []);

  return (
    <>
      <Topbar
        templates={templates}
        currentIndex={currentIndex}
        zoom={zoom}
        canUndo={canUndo}
        canRedo={canRedo}
        bgLocked={bgLocked}
        onBack={handleBack}
        onTemplateSwitch={handleTemplateSwitch}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onToggleBgLock={handleToggleBgLock}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        onExport={handleExport}
      />
      <div className="pt-14 h-screen">
        <Toolbar activeTool={activeTool} onSelectTool={handleSelectTool} onImageUpload={handleImageUpload} />
        <div className="relative w-full h-full bg-slate-100 overflow-hidden" id="editor-canvas-wrapper" ref={canvasWrapperRef}>
          <div className="w-full h-full" id="editor-canvas" ref={canvasRef} />
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
