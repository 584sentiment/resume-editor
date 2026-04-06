import type { ShapeItem } from '../types/index.js';

export type { ShapeItem };

// 基础几何图形
export const geometryShapes: ShapeItem[] = [
  {
    id: 'rect',
    name: '矩形',
    category: 'geometry',
    icon: 'M3 3h18v18H3z',
    create: (x, y) => ({
      tag: 'Rect',
      x, y,
      width: 120,
      height: 80,
      fill: '#2563EB',
      cornerRadius: 8,
    }),
  },
  {
    id: 'circle',
    name: '圆形',
    category: 'geometry',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
    create: (x, y) => ({
      tag: 'Ellipse',
      x, y,
      width: 80,
      height: 80,
      fill: '#3B82F6',
    }),
  },
  {
    id: 'rounded-rect',
    name: '圆角矩形',
    category: 'geometry',
    icon: 'M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z',
    create: (x, y) => ({
      tag: 'Rect',
      x, y,
      width: 140,
      height: 60,
      fill: '#60A5FA',
      cornerRadius: 30,
    }),
  },
  {
    id: 'line-h',
    name: '横线',
    category: 'geometry',
    icon: 'M3 12h18',
    create: (x, y) => ({
      tag: 'Line',
      x, y,
      width: 200,
      strokeWidth: 2,
      stroke: '#1E293B',
    }),
  },
  {
    id: 'line-v',
    name: '竖线',
    category: 'geometry',
    icon: 'M12 3v18',
    create: (x, y) => ({
      tag: 'Line',
      x, y,
      height: 200,
      strokeWidth: 2,
      stroke: '#1E293B',
    }),
  },
  {
    id: 'triangle',
    name: '三角形',
    category: 'geometry',
    icon: 'M12 3L2 21h20L12 3z',
    create: (x, y) => ({
      tag: 'Polygon',
      x, y,
      width: 100,
      height: 87,
      fill: '#F97316',
      points: [
        { x: 50, y: 0 },
        { x: 100, y: 87 },
        { x: 0, y: 87 },
      ],
    }),
  },
  {
    id: 'star',
    name: '五角星',
    category: 'geometry',
    icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    create: (x, y) => {
      const points: {x:number;y:number}[] = [];
      for (let i = 0; i < 10; i++) {
        const angle = (i * 36 - 90) * Math.PI / 180;
        const r = i % 2 === 0 ? 40 : 18;
        points.push({ x: 40 + r * Math.cos(angle), y: 40 + r * Math.sin(angle) });
      }
      return {
        tag: 'Polygon',
        x, y,
        width: 80,
        height: 80,
        fill: '#FBBF24',
        points,
      };
    },
  },
];

// 简历装饰图形
export const decorationShapes: ShapeItem[] = [
  {
    id: 'badge',
    name: '徽章',
    category: 'decoration',
    icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 3a2 2 0 110 4 2 2 0 010-4zm-3 7h6v1H9v-1zm0 2h6v1H9v-1zm0-5h2v1H9V9z',
    create: (x, y) => ({
      tag: 'Group',
      x, y,
      width: 80,
      height: 80,
      children: [
        { tag: 'Ellipse', x: 0, y: 0, width: 80, height: 80, fill: '#DBEAFE' },
        { tag: 'Ellipse', x: 8, y: 8, width: 64, height: 64, fill: '#2563EB' },
      ],
    }),
  },
  {
    id: 'avatar-placeholder',
    name: '头像框',
    category: 'decoration',
    icon: 'M12 4a4 4 0 100 8 4 4 0 000-8zM6 18c0-3.3 2.7-6 6-6s6 2.7 6 6H6z',
    create: (x, y) => ({
      tag: 'Group',
      x, y,
      width: 100,
      height: 100,
      children: [
        { tag: 'Ellipse', x: 0, y: 0, width: 100, height: 100, fill: '#F1F5F9', stroke: '#E2E8F0', strokeWidth: 2 },
        { tag: 'Ellipse', x: 30, y: 18, width: 40, height: 40, fill: '#CBD5E1' },
        { tag: 'Ellipse', x: 20, y: 70, width: 60, height: 35, fill: '#CBD5E1' },
      ],
    }),
  },
  {
    id: 'divider-dots',
    name: '圆点分隔线',
    category: 'decoration',
    icon: 'M4 12h2m4 0h2m4 0h2m4 0h2',
    create: (x, y) => ({
      tag: 'Group',
      x, y,
      width: 200,
      height: 12,
      children: [
        { tag: 'Ellipse', x: 0, y: 0, width: 12, height: 12, fill: '#CBD5E1' },
        { tag: 'Ellipse', x: 24, y: 0, width: 12, height: 12, fill: '#CBD5E1' },
        { tag: 'Ellipse', x: 48, y: 0, width: 12, height: 12, fill: '#CBD5E1' },
        { tag: 'Ellipse', x: 72, y: 0, width: 12, height: 12, fill: '#CBD5E1' },
        { tag: 'Ellipse', x: 96, y: 0, width: 12, height: 12, fill: '#CBD5E1' },
      ],
    }),
  },
  {
    id: 'skill-bar',
    name: '技能条',
    category: 'decoration',
    icon: 'M3 12h18v4H3z',
    create: (x, y) => ({
      tag: 'Group',
      x, y,
      width: 160,
      height: 20,
      children: [
        { tag: 'Rect', x: 0, y: 6, width: 160, height: 8, fill: '#F1F5F9', cornerRadius: 4 },
        { tag: 'Rect', x: 0, y: 6, width: 120, height: 8, fill: '#2563EB', cornerRadius: 4 },
      ],
    }),
  },
  {
    id: 'corner-decoration',
    name: '角标装饰',
    category: 'decoration',
    icon: 'M3 3h8v2H5v6H3V3z',
    create: (x, y) => ({
      tag: 'Group',
      x, y,
      width: 40,
      height: 40,
      children: [
        { tag: 'Rect', x: 0, y: 0, width: 40, height: 4, fill: '#2563EB' },
        { tag: 'Rect', x: 0, y: 0, width: 4, height: 40, fill: '#2563EB' },
      ],
    }),
  },
  {
    id: 'tag',
    name: '标签',
    category: 'decoration',
    icon: 'M3 7v10l9 5 9-5V7L12 2 3 7z',
    create: (x, y) => ({
      tag: 'Rect',
      x, y,
      width: 80,
      height: 28,
      fill: '#DBEAFE',
      stroke: '#2563EB',
      strokeWidth: 1,
      cornerRadius: 14,
    }),
  },
];

// 简历专用元素
export const resumeShapes: ShapeItem[] = [
  {
    id: 'section-header',
    name: '板块标题栏',
    category: 'resume',
    icon: 'M3 5h18v2H3zm0 4h12v2H3z',
    create: (x, y) => ({
      tag: 'Group',
      x, y,
      width: 260,
      height: 40,
      children: [
        { tag: 'Rect', x: 0, y: 0, width: 260, height: 40, fill: '#F1F5F9', cornerRadius: 8 },
        { tag: 'Rect', x: 0, y: 0, width: 4, height: 40, fill: '#2563EB', cornerRadius: 2 },
      ],
    }),
  },
  {
    id: 'timeline-dot',
    name: '时间轴节点',
    category: 'resume',
    icon: 'M12 2a10 10 0 100 20 10 10 0 000-20z',
    create: (x, y) => ({
      tag: 'Group',
      x, y,
      width: 20,
      height: 120,
      children: [
        { tag: 'Ellipse', x: 2, y: 0, width: 16, height: 16, fill: '#2563EB' },
        { tag: 'Rect', x: 9, y: 16, width: 2, height: 104, fill: '#E2E8F0' },
      ],
    }),
  },
  {
    id: 'info-card',
    name: '信息卡片',
    category: 'resume',
    icon: 'M3 5h18v14H3z',
    create: (x, y) => ({
      tag: 'Rect',
      x, y,
      width: 240,
      height: 100,
      fill: '#FFFFFF',
      stroke: '#E2E8F0',
      strokeWidth: 1,
      cornerRadius: 12,
      shadow: {
        x: 0,
        y: 2,
        blur: 8,
        spread: 0,
        color: 'rgba(0,0,0,0.06)',
      },
    }),
  },
  {
    id: 'progress-circle',
    name: '进度环',
    category: 'resume',
    icon: 'M12 2a10 10 0 100 20 10 10 0 000-20z',
    create: (x, y) => ({
      tag: 'Group',
      x, y,
      width: 60,
      height: 60,
      children: [
        { tag: 'Ellipse', x: 0, y: 0, width: 60, height: 60, fill: 'none', stroke: '#F1F5F9', strokeWidth: 6 },
        { tag: 'Ellipse', x: 0, y: 0, width: 60, height: 60, fill: 'none', stroke: '#2563EB', strokeWidth: 6, strokeCap: 'round' },
      ],
    }),
  },
  {
    id: 'social-icon',
    name: '社交图标',
    category: 'resume',
    icon: 'M12 2a10 10 0 100 20 10 10 0 000-20z',
    create: (x, y) => ({
      tag: 'Group',
      x, y,
      width: 36,
      height: 36,
      children: [
        { tag: 'Ellipse', x: 0, y: 0, width: 36, height: 36, fill: '#F1F5F9' },
      ],
    }),
  },
];

export const allShapes: ShapeItem[] = [
  ...geometryShapes,
  ...decorationShapes,
  ...resumeShapes,
];
