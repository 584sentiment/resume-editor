/** 图形元素定义 */
export interface ShapeItem {
  id: string;
  name: string;
  category: 'geometry' | 'decoration' | 'resume';
  icon: string;
  create: (x: number, y: number) => Record<string, unknown>;
}

/** 简历模板 */
export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  color: string;
  accent: string;
  preview: string;
}

/** 模板分类 */
export type TemplateCategory = 'modern' | 'elegant' | 'creative' | 'minimal';

/** AI 操作类型 */
export type AIAction = 'rewrite' | 'optimize';

/** 缩放事件 */
export interface ZoomEvent {
  scale?: number;
}
