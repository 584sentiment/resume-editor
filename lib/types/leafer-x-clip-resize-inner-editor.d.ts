declare module 'leafer-x-clip-resize-inner-editor' {
  import type { ILeafer, ILeaf, IGroup, Image } from '@leafer-ui/core';

  /**
   * ClipImage - 支持裁剪的图片组件
   * 双击可开启内部编辑进行裁剪
   */
  export interface ClipImage extends Image {
    /** 是否启用裁剪模式 */
    clipEnabled?: boolean;
    /** 裁剪路径 */
    clipPath?: string;
  }

  export interface ClipImageData {
    clipPath?: string;
  }

  /**
   * ClipResizeEditor - 裁剪调整编辑器
   */
  export interface ClipResizeEditor {
    name: string;
    config: ClipResizeEditorConfig;
    run(LeaferUI: unknown): void;
    onLeafer(leafer: ILeafer): void;
  }

  export interface ClipResizeEditorConfig {
    /** 是否启用裁剪模式 */
    clipEnabled?: boolean;
    /** 裁剪框样式 */
    clipStyle?: {
      borderColor?: string;
      fill?: string;
      strokeWidth?: number;
    };
  }

  export interface ClipResizeEditorEvent {
    type: string;
    target?: ILeaf;
  }

  /**
   * ClipResizeEditor 插件实例
   */
  export const ClipResizeEditor: ClipResizeEditor;

  /**
   * ClipImage 组件数据
   */
  export const ClipImageData: {
    defaults: ClipImageData;
  };

  /**
   * 创建带裁剪功能的图片
   */
  export function createClipImage(options: {
    x: number;
    y: number;
    width: number;
    height: number;
    url: string;
    clip?: boolean;
  }): ClipImage;

  /**
   * 获取裁剪路径
   */
  export function getClipPath(element: ILeaf): string | null;

  /**
   * 设置裁剪路径
   */
  export function setClipPath(element: ILeaf, path: string): void;
}
