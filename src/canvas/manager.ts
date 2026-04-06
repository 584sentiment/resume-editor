import type { ZoomEvent } from '../types/index.js';
import { CANVAS } from '../constants/index.js';
import { templates, createTemplateContent } from '../templates/index.js';
import { allShapes } from '../shapes/index.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyInstance = any;

/** 画布管理器 - 封装所有 LeaferJS 画布操作 */
export class CanvasManager {
  private leafer: AnyInstance = null;
  private editor: AnyInstance = null;

  get instance() {
    return this.leafer;
  }

  get editorInstance() {
    return this.editor;
  }

  /** 初始化画布 */
  async init(container: HTMLElement): Promise<void> {
    const canvasEl = container.querySelector('#editor-canvas') as HTMLElement;
    const wrapper = container.querySelector('#editor-canvas-wrapper') as HTMLElement;
    if (!canvasEl || !wrapper) return;

    const { Leafer } = await import('leafer-ui');
    const { Editor } = await import('@leafer-in/editor');

    const rect = wrapper.getBoundingClientRect();

    this.leafer = new Leafer({
      view: canvasEl,
      width: rect.width,
      height: rect.height,
      fill: '#F1F5F9',
      zoom: { min: CANVAS.ZOOM_MIN, max: CANVAS.ZOOM_MAX },
      move: { drag: true },
      wheel: { zoomMode: true },
    });

    this.editor = new Editor({
      skewable: false,
      rotatePoint: { x: 0.5, y: 0.5 },
    });
    this.leafer.add(this.editor);

    // 点阵背景
    this.addDotGrid(rect.width, rect.height);

    // 保存引用供外部访问
    (canvasEl as any)._leafer = this.leafer;
    (canvasEl as any)._editor = this.editor;

    // 窗口大小监听
    const resizeObserver = new ResizeObserver(() => {
      const newRect = wrapper.getBoundingClientRect();
      this.leafer.width = newRect.width;
      this.leafer.height = newRect.height;
    });
    resizeObserver.observe(wrapper);
  }

  /** 加载模板到画布中心 */
  loadTemplate(templateIndex: number): void {
    if (!this.leafer) return;

    const wrapper = this.leafer.view?.parentElement;
    const rect = wrapper?.getBoundingClientRect();
    const width = rect?.width || 800;
    const height = rect?.height || 600;

    const template = templates[templateIndex];
    const content = createTemplateContent(template);
    this.leafer.add({
      tag: 'Group',
      x: (width - CANVAS.RESUME_WIDTH) / 2,
      y: (height - CANVAS.RESUME_HEIGHT) / 2,
      children: content,
    });
  }

  /** 切换模板 */
  async switchTemplate(templateIndex: number): Promise<void> {
    if (!this.leafer) return;

    this.leafer.removeAll();

    const { Editor } = await import('@leafer-in/editor');
    this.editor = new Editor({ skewable: false, rotatePoint: { x: 0.5, y: 0.5 } });
    this.leafer.add(this.editor);

    const wrapper = this.leafer.view?.parentElement;
    const rect = wrapper?.getBoundingClientRect();
    if (rect) this.addDotGrid(rect.width, rect.height);

    this.loadTemplate(templateIndex);
  }

  /** 添加图形到画布中心 */
  async addShape(shapeId: string): Promise<void> {
    if (!this.leafer) return;

    if (shapeId === 'text') {
      this.leafer.add({
        tag: 'Text',
        x: 400,
        y: 300,
        text: '双击编辑文字',
        fill: '#1E293B',
        fontSize: 16,
        fontFamily: 'Inter, sans-serif',
      });
      return;
    }

    const shape = allShapes.find(s => s.id === shapeId);
    if (shape) {
      const centerX = (this.leafer.width || 800) / 2;
      const centerY = (this.leafer.height || 600) / 2;
      this.leafer.add(shape.create(centerX, centerY));
    }
  }

  /** 缩放到指定比例 */
  setZoom(value: number): void {
    if (this.leafer) {
      (this.leafer as any).zoom = value;
    }
  }

  /** 获取当前缩放比例 */
  getZoom(): number {
    return (this.leafer as any)?.zoom || 1;
  }

  /** 放大 */
  zoomIn(): void {
    this.leafer?.zoomIn();
  }

  /** 缩小 */
  zoomOut(): void {
    this.leafer?.zoomOut();
  }

  /** 重置视图 */
  resetView(): void {
    this.setZoom(1);
    if (this.leafer) {
      this.leafer.x = 0;
      this.leafer.y = 0;
    }
  }

  /** 监听选择事件 */
  onSelect(callback: (element: AnyInstance | null) => void): void {
    if (!this.leafer) return;
    this.leafer.on('select', (e: { value: AnyInstance }) => callback(e.value));
    this.leafer.on('deselect', () => callback(null));
  }

  /** 监听缩放事件 */
  onZoom(callback: (zoom: number) => void): void {
    if (!this.leafer) return;
    this.leafer.on('zoom', (e: ZoomEvent) => {
      callback(e.scale || (this.leafer as any).zoom || 1);
    });
  }

  /** 导出为 JSON */
  toJSON(): string | null {
    if (!this.leafer) return null;
    return JSON.stringify(this.leafer.toJSON(), null, 2);
  }

  /** 销毁画布 */
  destroy(): void {
    if (this.leafer) {
      this.leafer.destroy();
      this.leafer = null;
      this.editor = null;
    }
  }

  /** 创建点阵背景 */
  private addDotGrid(width: number, height: number): void {
    if (!this.leafer) return;

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

    this.leafer.add({
      tag: 'Group',
      x: 0,
      y: 0,
      children: dots,
      editable: false,
      hittable: false,
    });
  }
}
