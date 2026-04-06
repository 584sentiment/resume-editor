import type { ZoomEvent } from '../types/index.js';
import { CANVAS } from '../constants/index.js';
import { templates, createTemplateContent } from '../templates/index.js';
import { allShapes } from '../shapes/index.js';
import { App, Rect, DragEvent } from 'leafer-ui';
import { Editor } from '@leafer-in/editor';
import '@leafer-in/text-editor';
import '@leafer-in/viewport';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyInstance = any;

/** 画布管理器 - 使用 Leafer App 三层架构封装所有画布操作 */
export class CanvasManager {
  private app: AnyInstance = null;
  private editor: AnyInstance = null;
  private templateGroup: AnyInstance = null;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;
  private drawEvents: (() => void)[] | null = null;
  private currentDrawShapeId: string | null = null;

  /** 获取 App 实例（用于事件监听等） */
  get instance() {
    return this.app;
  }

  /** 获取 tree 层（内容层） */
  get treeLayer() {
    return this.app?.tree || null;
  }

  get editorInstance() {
    return this.editor;
  }

  /** 初始化画布，接受 canvas 容器和 wrapper 元素 */
  init(canvasEl: HTMLElement, wrapper: HTMLElement): void {
    const rect = wrapper.getBoundingClientRect();

    // 使用 App 创建三层画布（ground/tree/sky 分层渲染）
    this.app = new App({
      view: canvasEl,
      width: rect.width,
      height: rect.height,
      fill: '#F1F5F9',
      type: 'design',
      ground: { type: 'design' },   // 背景层：点阵网格
      tree: { type: 'design' },      // 内容层：简历模板 + 用户图形
      sky: {},                        // 天空层：图形编辑器实例（Editor）
      editor: {
        moveable: true,
        resizeable: true,
        rotateable: true,
      },
    });

    // App 会自动创建 editor 并添加到 sky 层
    this.editor = this.app.editor;

    // 键盘事件：Delete 删除选中元素，Escape 取消选择
    this.keyHandler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // 忽略输入框中的按键
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && this.editor) {
        const list = this.editor.list;
        if (list && list.length > 0) {
          list.forEach((item: AnyInstance) => item.remove());
          this.editor.cancel();
          e.preventDefault();
        }
      }
      if (e.key === 'Escape' && this.editor) {
        this.editor.cancel();
      }
    };
    document.addEventListener('keydown', this.keyHandler);

    // 点阵背景添加到 ground 层
    this.addDotGrid(rect.width, rect.height);

    // 窗口大小监听
    const resizeObserver = new ResizeObserver(() => {
      const newRect = wrapper.getBoundingClientRect();
      if (this.app) {
        this.app.width = newRect.width;
        this.app.height = newRect.height;
      }
    });
    resizeObserver.observe(wrapper);
  }

  /** 加载模板到 tree 层中心 */
  loadTemplate(templateIndex: number): void {
    const tree = this.treeLayer;
    if (!tree) return;

    const wrapper = this.app?.view?.parentElement;
    const rect = wrapper?.getBoundingClientRect();
    const width = rect?.width || 800;
    const height = rect?.height || 600;

    const template = templates[templateIndex];
    const content = createTemplateContent(template);
    this.templateGroup = {
      tag: 'Group',
      x: (width - CANVAS.RESUME_WIDTH) / 2,
      y: (height - CANVAS.RESUME_HEIGHT) / 2,
      children: content,
      editable: true,
    };
    tree.add(this.templateGroup);
  }

  /** 切换模板 - 仅清除 tree 层内容，保留 sky 层 Editor 和 ground 层点阵 */
  switchTemplate(templateIndex: number): void {
    const tree = this.treeLayer;
    if (!tree || !this.app) return;

    // 移除旧的模板组
    if (this.templateGroup) {
      this.templateGroup.remove();
      this.templateGroup = null;
    }

    // 清除 tree 层所有内容（不包括 ground 层的点阵）
    const children = [...tree.children];
    children.forEach((child: AnyInstance) => child.remove());

    this.loadTemplate(templateIndex);
  }

  /** 添加图形到 tree 层中心 */
  addShape(shapeId: string): void {
    const tree = this.treeLayer;
    if (!tree) return;

    if (shapeId === 'text') {
      tree.add({
        tag: 'Text',
        x: 400,
        y: 300,
        text: '双击编辑文字',
        fill: '#1E293B',
        fontSize: 16,
        fontFamily: 'Inter, sans-serif',
        editable: true,
      });
      return;
    }

    const shape = allShapes.find(s => s.id === shapeId);
    if (shape) {
      const centerX = (this.app?.width || 800) / 2;
      const centerY = (this.app?.height || 600) / 2;
      const element = shape.create(centerX, centerY);
      element.editable = true;
      tree.add(element);
    }
  }

  /** 进入绘制模式：使用 Leafer 原生 DragEvent */
  enterDrawMode(shapeId: string, onComplete?: () => void): void {
    const tree = this.treeLayer;
    if (!tree) return;

    this.exitDrawMode();
    this.currentDrawShapeId = shapeId;

    // 切换 app 为绘制模式
    (this.app as any).mode = 'draw';

    let drawPreview: AnyInstance = null;
    let startX = 0;
    let startY = 0;

    const onDragStart = (e: AnyInstance) => {
      const { x, y } = e;
      startX = x;
      startY = y;

      drawPreview = new Rect({
        x,
        y,
        width: 1,
        height: 1,
        fill: 'rgba(37, 99, 235, 0.12)',
        stroke: '#2563EB',
        strokeWidth: 1,
        dashPattern: [4, 4],
        editable: false,
        hittable: false,
      });
      tree.add(drawPreview);
    };

    const onDrag = (e: AnyInstance) => {
      if (!drawPreview) return;
      const { x, y } = e;
      drawPreview.x = Math.min(startX, x);
      drawPreview.y = Math.min(startY, y);
      drawPreview.width = Math.abs(x - startX);
      drawPreview.height = Math.abs(y - startY);
    };

    const onDragEnd = (e: AnyInstance) => {
      const { x, y } = e;
      const width = Math.abs(x - startX);
      const height = Math.abs(y - startY);

      // 移除预览矩形
      if (drawPreview) {
        drawPreview.remove();
        drawPreview = null;
      }

      // 恢复正常模式
      this.exitDrawMode();

      // 创建实际图形（尺寸太小时忽略，视为误点击）
      if (width > 3 || height > 3) {
        const finalX = Math.min(startX, x);
        const finalY = Math.min(startY, y);
        this.commitShape(shapeId, finalX, finalY, width, height);
      }

      onComplete?.();
    };

    // 绑定 DragEvent
    this.app.on(DragEvent.START, onDragStart);
    this.app.on(DragEvent.DRAG, onDrag);
    this.app.on(DragEvent.END, onDragEnd);

    this.drawEvents = [
      () => this.app.off(DragEvent.START, onDragStart),
      () => this.app.off(DragEvent.DRAG, onDrag),
      () => this.app.off(DragEvent.END, onDragEnd),
    ];
  }

  /** 退出绘制模式 */
  exitDrawMode(): void {
    if (this.drawEvents) {
      this.drawEvents.forEach(off => off());
      this.drawEvents = null;
    }
    this.currentDrawShapeId = null;
    if (this.app) {
      (this.app as any).mode = 'normal';
    }
  }

  /** 提交绘制：用实际元素替换预览矩形 */
  private commitShape(shapeId: string, x: number, y: number, width: number, height: number): void {
    const tree = this.treeLayer;
    if (!tree) return;

    if (shapeId === 'text') {
      tree.add({
        tag: 'Text',
        x,
        y,
        width: width > 10 ? width : undefined,
        text: '双击编辑文字',
        fill: '#1E293B',
        fontSize: 16,
        fontFamily: 'Inter, sans-serif',
        editable: true,
      });
      return;
    }

    const shape = allShapes.find(s => s.id === shapeId);
    if (!shape) return;

    const element = shape.create(x, y);

    // Line 元素需要保持方向：竖线只用 height，横线只用 width
    if (element.tag === 'Line') {
      if (shapeId === 'line-v') {
        element.height = height > 5 ? height : 200;
      } else {
        element.width = width > 5 ? width : 200;
      }
    } else {
      if (width > 5) element.width = width;
      if (height > 5) element.height = height;
    }
    element.editable = true;
    tree.add(element);
  }

  /** 缩放到指定比例 */
  setZoom(value: number): void {
    if (this.app) {
      (this.app as any).zoom = value;
    }
  }

  /** 获取当前缩放比例 */
  getZoom(): number {
    return (this.app as any)?.zoom || 1;
  }

  /** 放大 */
  zoomIn(): void {
    this.app?.zoomIn();
  }

  /** 缩小 */
  zoomOut(): void {
    this.app?.zoomOut();
  }

  /** 重置视图 */
  resetView(): void {
    this.setZoom(1);
    if (this.app) {
      this.app.x = 0;
      this.app.y = 0;
    }
  }

  /** 监听选择事件 */
  onSelect(callback: (element: AnyInstance | null) => void): void {
    if (!this.editor) return;
    this.editor.on('editor.select', (e: { value: AnyInstance }) => callback(e.value));
  }

  /** 监听缩放事件 */
  onZoom(callback: (zoom: number) => void): void {
    if (!this.app) return;
    this.app.on('zoom', (e: ZoomEvent) => {
      callback(e.scale || (this.app as any).zoom || 1);
    });
  }

  /** 获取选中的元素列表 */
  getSelectedElements(): AnyInstance[] {
    return this.editor?.list || [];
  }

  /** 删除选中的元素 */
  removeSelected(): void {
    if (!this.editor) return;
    const list = this.editor.list;
    if (list && list.length > 0) {
      list.forEach((item: AnyInstance) => item.remove());
      this.editor.cancel();
    }
  }

  /** 取消选择 */
  deselect(): void {
    this.editor?.cancel();
  }

  /** 编组选中元素 */
  groupSelected(): void {
    this.editor?.group();
  }

  /** 解组选中元素 */
  ungroupSelected(): void {
    this.editor?.ungroup();
  }

  /** 置顶选中元素 */
  bringToFront(): void {
    this.editor?.toTop();
  }

  /** 置底选中元素 */
  sendToBack(): void {
    this.editor?.toBottom();
  }

  /** 设置选中元素的属性 */
  setElementProperty(key: string, value: unknown): void {
    if (!this.editor) return;
    const list = this.editor.list;
    if (list && list.length > 0) {
      list.forEach((item: AnyInstance) => {
        (item as Record<string, unknown>)[key] = value;
      });
    }
  }

  /** 导出为 JSON */
  toJSON(): string | null {
    if (!this.app) return null;
    return JSON.stringify(this.app.toJSON(), null, 2);
  }

  /** 销毁画布 */
  destroy(): void {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
    this.exitDrawMode();
    this.templateGroup = null;
    if (this.app) {
      this.app.destroy();
      this.app = null;
      this.editor = null;
    }
  }

  /** 创建点阵背景到 ground 层 */
  private addDotGrid(width: number, height: number): void {
    const ground = this.app?.ground;
    if (!ground) return;

    const { DOT_SPACING, DOT_SIZE } = CANVAS;
    const dots: AnyInstance[] = [];
    const cols = Math.ceil(width / DOT_SPACING) + 2;
    const rows = Math.ceil(height / DOT_SPACING) + 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        dots.push({
          tag: 'Ellipse',
          x: col * DOT_SPACING - 1,
          y: row * DOT_SPACING - 1,
          width: DOT_SIZE,
          height: DOT_SIZE,
          fill: '#CBD5E1',
        });
      }
    }

    ground.add({
      tag: 'Group',
      x: 0,
      y: 0,
      children: dots,
      editable: false,
      hittable: false,
    });
  }
}
