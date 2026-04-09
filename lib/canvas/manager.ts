import type { ZoomEvent } from '@/lib/types/index';
import { CANVAS } from '@/lib/constants/index';
import { templates, createTemplateContent } from '@/lib/templates/index';
import { allShapes } from '@/lib/shapes/index';
import { App, Rect, DragEvent, Group, Image, Text, Rect as RectClass, Ellipse, Line, Path, Polygon } from 'leafer-ui';
import { Editor } from '@leafer-in/editor';
import '@leafer-in/text-editor';
import '@leafer-in/viewport';
import '@leafer-in/view';
import '@leafer-in/export';
import { Ruler } from 'leafer-x-ruler';
import {
  historyPlugin,
  createSnapshot,
  undoLeafer,
  redoLeafer,
  getHistoryManager,
  clearHistory,
} from 'leafer-x-history';
import * as ClipModule from 'leafer-x-clip-resize-inner-editor';

// 设置插件全局配置：提供自定义 createElement 以支持反序列化重建元素
// 插件默认依赖全局 LeaferUI 变量，模块化项目中不存在，需手动提供
(historyPlugin as AnyInstance).run(null, {
  serializerOptions: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createElement: (tag: string, props: any): any => {
      // 支持 ClipImage 标签
      if (tag === 'ClipImage') {
        const ClipImageClass = (ClipModule as any).ClipImage;
        if (ClipImageClass) {
          return new ClipImageClass(props);
        }
        return null;
      }
      // 使用 Leafer 内置类创建元素
      switch (tag) {
        case 'Group':
          return new Group(props);
        case 'Image':
          return new Image(props);
        case 'Text':
          return new Text(props);
        case 'Rect':
          return new RectClass(props);
        case 'Ellipse':
          return new Ellipse(props);
        case 'Line':
          return new Line(props);
        case 'Path':
          return new Path(props);
        case 'Polygon':
          return new Polygon(props);
        default:
          console.warn('[createElement] Unknown tag:', tag);
          return null;
      }
    },
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyInstance = any;

/** 画布管理器 - 使用 Leafer App 三层架构封装所有画布操作 */
export class CanvasManager {
  private app: AnyInstance = null;
  private editor: AnyInstance = null;
  private ruler: Ruler | null = null;
  private templateGroup: AnyInstance = null;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;
  private drawEvents: (() => void)[] | null = null;
  private currentDrawShapeId: string | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private keyUpHandler: ((e: KeyboardEvent) => void) | null = null;
  private bgLocked = true;

  private static readonly BG_IDS = ['bg-left', 'bg-right', 'bg-deco'];

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

    // 初始化标尺线插件
    this.ruler = new Ruler(this.app);

    // 手动注册历史插件到 tree 层
    (historyPlugin as AnyInstance).onLeafer(this.app.tree);

    // 裁剪插件通过 @registerInnerEditor() 自动注册，只需导入模块即可
    void (ClipModule as any).ClipResizeEditor;

    // 将 ClipResizeEditor 注册为 ClipImage 的内部编辑器
    const ClipImageClass = (ClipModule as any).ClipImage;
    const ClipResizeEditorClass = (ClipModule as any).ClipResizeEditor;
    if (ClipImageClass && ClipResizeEditorClass) {
      ClipImageClass.setEditInner(ClipResizeEditorClass.name);
    }

    // 监听拖拽/缩放/旋转完成事件，保存快照
    this.editor.on('drag.end', () => {
      this.snapshot();
    });

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
          this.snapshot();
        }
      }
      if (e.key === 'Escape' && this.editor) {
        this.editor.cancel();
      }
    };
    document.addEventListener('keydown', this.keyHandler);

    // 方向键释放后保存快照（Editor 内部处理方向键移动，但不会触发 drag.end）
    this.keyUpHandler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      if (this.editor?.list?.length > 0) {
        this.snapshot();
      }
    };
    document.addEventListener('keyup', this.keyUpHandler);

    // 点阵背景添加到 ground 层
    this.addDotGrid(rect.width, rect.height);

    // 窗口大小监听
    const resizeObserver = new ResizeObserver(() => {
      const newRect = wrapper.getBoundingClientRect();
      if (this.app) {
        this.app.width = newRect.width;
        this.app.height = newRect.height;
        // 触发 resize 事件以同步更新标尺
        this.ruler?.forceRender();
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

    // 使用 Group 类显式创建，以便获取正确的引用
    const group = new Group({
      x: (width - CANVAS.RESUME_WIDTH) / 2,
      y: (height - CANVAS.RESUME_HEIGHT) / 2,
      children: content,
      editable: false, // Group 本身不可编辑，只让子元素可编辑
    });
    tree.add(group);
    this.templateGroup = group;

    this.bgLocked = true;
    this.snapshot();
  }

  /** 切换模板 - 仅清除 tree 层内容，保留 sky 层 Editor 和 ground 层点阵 */
  switchTemplate(templateIndex: number): void {
    const tree = this.treeLayer;
    if (!tree || !this.app) return;

    // 切换模板时清空历史记录
    this.clearHistoryState();

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
      this.snapshot();
      return;
    }

    const shape = allShapes.find(s => s.id === shapeId);
    if (shape) {
      const centerX = (this.app?.width || 800) / 2;
      const centerY = (this.app?.height || 600) / 2;
      const element = shape.create(centerX, centerY);
      element.editable = true;
      tree.add(element);
      this.snapshot();
    }
  }

  /** 添加图片到 tree 层中心 */
  addImage(url: string): void {
    const tree = this.treeLayer;
    if (!tree) return;

    const centerX = (this.app?.width || 800) / 2;
    const centerY = (this.app?.height || 600) / 2;

    // 直接创建 ClipImage 实例
    const ClipImageClass = (ClipModule as any).ClipImage;
    if (ClipImageClass) {
      const image = new ClipImageClass({
        x: centerX - 100,
        y: centerY - 100,
        width: 200,
        height: 200,
        url,
        editable: true,
      });
      tree.add(image);
    }
    this.snapshot();
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
      this.snapshot();
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
    this.snapshot();
  }

  /** 缩放到指定比例 */
  setZoom(value: number): void {
    this.treeLayer?.zoom(value);
  }

  /** 获取当前缩放比例 */
  getZoom(): number {
    return this.treeLayer?.scale || 1;
  }

  /** 放大 */
  zoomIn(): void {
    const current = this.getZoom();
    this.treeLayer?.zoom(Math.min(current + 0.1, 5));
  }

  /** 缩小 */
  zoomOut(): void {
    const current = this.getZoom();
    this.treeLayer?.zoom(Math.max(current - 0.1, 0.1));
  }

  /** 重置视图 */
  resetView(): void {
    this.treeLayer?.zoom(1);
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
      this.snapshot();
    }
  }

  /** 取消选择 */
  deselect(): void {
    this.editor?.cancel();
  }

  /** 编组选中元素 */
  groupSelected(): void {
    this.editor?.group();
    this.snapshot();
  }

  /** 解组选中元素 */
  ungroupSelected(): void {
    this.editor?.ungroup();
    this.snapshot();
  }

  /** 置顶选中元素 */
  bringToFront(): void {
    this.editor?.toTop();
    this.snapshot();
  }

  /** 置底选中元素 */
  sendToBack(): void {
    this.editor?.toBottom();
    this.snapshot();
  }

  /** 设置选中元素的属性（防抖快照） */
  setElementProperty(key: string, value: unknown): void {
    if (!this.editor) return;
    const list = this.editor.list;
    if (list && list.length > 0) {
      list.forEach((item: AnyInstance) => {
        (item as Record<string, unknown>)[key] = value;
      });
      this.debouncedSnapshot();
    }
  }

  /** 切换标尺显示/隐藏 */
  toggleRuler(enabled?: boolean): void {
    if (!this.ruler) return;
    this.ruler.enabled = enabled ?? !this.ruler.enabled;
  }

  /** 获取标尺启用状态 */
  isRulerEnabled(): boolean {
    return this.ruler?.enabled ?? false;
  }

  /** 切换背景锁定状态（锁定时背景不可交互，解锁后可选中调整） */
  toggleBackgroundsLock(): boolean {
    this.bgLocked = !this.bgLocked;
    const group = this.templateGroup;
    if (!group) return this.bgLocked;

    const interactive = !this.bgLocked;

    CanvasManager.BG_IDS.forEach(id => {
      const children = group.children || [];
      let el: AnyInstance | null = null;
      for (const child of children) {
        if (child.id === id) {
          el = child;
          break;
        }
      }
      if (el) {
        el.editable = interactive;
        el.hittable = interactive;
        el.draggable = interactive;
      }
    });
    return this.bgLocked;
  }

  /** 重新应用背景锁定状态（用于撤销后恢复正确的锁定状态） */
  reapplyBackgroundLock(): void {
    const tree = this.treeLayer;
    if (!tree) return;

    const interactive = !this.bgLocked;

    // 在整个 tree 中查找背景元素
    CanvasManager.BG_IDS.forEach(id => {
      let el: AnyInstance | null = null;

      // 方法1：在 tree 的直接子元素中查找
      const directChildren = tree.children || [];
      for (const child of directChildren) {
        if (child.id === id) {
          el = child;
          break;
        }
      }

      // 方法2：如果 templateGroup 存在，在其子元素中查找
      if (!el && this.templateGroup) {
        const groupChildren = this.templateGroup.children || [];
        for (const child of groupChildren) {
          if (child.id === id) {
            el = child;
            break;
          }
        }
      }

      // 方法3：递归搜索所有子元素
      if (!el) {
        const findDeep = (parent: AnyInstance): AnyInstance | null => {
          const children = parent.children || [];
          for (const child of children) {
            if (child.id === id) return child;
            if (child.children?.length) {
              const found = findDeep(child);
              if (found) return found;
            }
          }
          return null;
        };
        el = findDeep(tree);
      }

      if (el) {
        el.editable = interactive;
        el.hittable = interactive;
        el.draggable = interactive;
      }
    });

    // 取消当前选择
    this.editor?.cancel();
  }

  /** 获取背景锁定状态 */
  isBackgroundsLocked(): boolean {
    return this.bgLocked;
  }

  /** 导出为 JSON */
  toJSON(): string | null {
    if (!this.app) return null;
    return JSON.stringify(this.app.toJSON(), null, 2);
  }

  /** 导出为图片格式 (PNG/JPG) */
  async exportImage(format: 'png' | 'jpg'): Promise<Blob | null> {
    const tree = this.treeLayer;
    if (!tree) return null;

    try {
      const result = await tree.export(format, {
        quality: format === 'jpg' ? 0.92 : undefined,
        pixelRatio: 2,
      });

      if (result.error) {
        return null;
      }

      if (result.data instanceof Blob) {
        return result.data;
      }

      const dataUrl = result.data as string;
      return fetch(dataUrl).then((r) => r.blob());
    } catch {
      return null;
    }
  }

  /** 导出为 PDF */
  async exportPDF(): Promise<Blob | null> {
    const tree = this.treeLayer;
    if (!tree) return null;

    try {
      const result = await tree.export('png', {
        pixelRatio: 2,
      });

      if (result.error) {
        return null;
      }

      let imageDataUrl: string;
      if (result.data instanceof Blob) {
        imageDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(result.data);
        });
      } else {
        imageDataUrl = result.data;
      }

      const { jsPDF } = await import('jspdf');

      const imgWidth = result.width;
      const imgHeight = result.height;
      const ratio = imgWidth / imgHeight;

      let pdfWidth: number;
      let pdfHeight: number;
      let orientation: 'portrait' | 'landscape';

      if (ratio > 1) {
        orientation = 'landscape';
        pdfHeight = 200;
        pdfWidth = pdfHeight * ratio;
      } else {
        orientation = 'portrait';
        pdfWidth = 200;
        pdfHeight = pdfWidth / ratio;
      }

      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(imageDataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);

      return pdf.output('blob');
    } catch {
      return null;
    }
  }

  /** 创建历史快照 */
  snapshot(): void {
    const tree = this.treeLayer;
    if (tree) createSnapshot(tree);
  }

  /** 防抖快照（300ms），用于属性面板拖拽滑块等连续操作 */
  debouncedSnapshot(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.snapshot(), 300);
  }

  /** 撤销 */
  undo(): boolean {
    const tree = this.treeLayer;
    const result = tree ? undoLeafer(tree) : false;
    if (result) {
      // 撤销后重新建立 templateGroup 引用
      this.rebuildTemplateGroupRef();
      // 撤销后重新应用背景锁定状态（因为历史快照可能恢复了旧的 editable 状态）
      this.reapplyBackgroundLock();
    }
    return result;
  }

  /** 重新建立 templateGroup 引用（撤销后 tree 结构可能改变） */
  rebuildTemplateGroupRef(): void {
    const tree = this.treeLayer;
    if (!tree) return;

    // 查找具有 children 数量为 42 的 Group 作为 templateGroup
    for (const child of tree.children || []) {
      if (child.tag === 'Group' && child.children?.length === 42) {
        this.templateGroup = child;
        return;
      }
    }
  }

  /** 重做 */
  redo(): boolean {
    const tree = this.treeLayer;
    const result = tree ? redoLeafer(tree) : false;
    if (result) {
      // 重做后重新建立 templateGroup 引用
      this.rebuildTemplateGroupRef();
      // 重做后重新应用背景锁定状态
      this.reapplyBackgroundLock();
    }
    return result;
  }

  /** 是否可以撤销 */
  canUndo(): boolean {
    const tree = this.treeLayer;
    const mgr = tree ? getHistoryManager(tree) : undefined;
    return mgr?.canUndo ?? false;
  }

  /** 是否可以重做 */
  canRedo(): boolean {
    const tree = this.treeLayer;
    const mgr = tree ? getHistoryManager(tree) : undefined;
    return mgr?.canRedo ?? false;
  }

  /** 清空历史记录 */
  async clearHistoryState(): Promise<void> {
    const tree = this.treeLayer;
    if (tree) await clearHistory(tree);
  }

  /** 监听历史变化 */
  onHistoryChange(callback: () => void): () => void {
    const tree = this.treeLayer;
    const mgr = tree ? getHistoryManager(tree) : undefined;
    if (!mgr) return () => {};
    const handler = () => callback();
    mgr.on('push', handler);
    mgr.on('undo', handler);
    mgr.on('redo', handler);
    mgr.on('clear', handler);
    return () => {
      mgr.off('push', handler);
      mgr.off('undo', handler);
      mgr.off('redo', handler);
      mgr.off('clear', handler);
    };
  }

  /** 销毁画布 */
  destroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
    if (this.keyUpHandler) {
      document.removeEventListener('keyup', this.keyUpHandler);
      this.keyUpHandler = null;
    }
    this.exitDrawMode();
    this.templateGroup = null;
    this.ruler = null;
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
