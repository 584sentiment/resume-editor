# ResumeCraft - 创意简历编辑器

基于 LeaferJS + React 构建的在线简历创意画布编辑器，提供所见即所得的编辑体验。

## 功能特性

- **6 款精选模板** — 现代蓝、优雅深色、创意珊瑚、极简青绿、专业紫、温馨粉
- **丰富的图形元素** — 几何图形、装饰元素、简历专用组件（技能条、时间轴、进度环等）
- **自由绘制** — 拖拽绘制任意大小的图形，实时预览
- **元素编辑** — 选中后可移动、缩放、旋转，支持属性面板调节颜色、透明度、圆角
- **编组与层级** — 多元素编组/解组，层级置顶/置底
- **文本编辑** — 双击文本直接编辑，支持 AI 智能改写与优化
- **视图控制** — 缩放、平移、标尺线辅助
- **导出功能** — 一键导出 JSON 设计文件

## 技术栈

| 技术 | 用途 |
|------|------|
| [LeaferJS](https://www.leaferjs.com/) 2.0 | 画布渲染引擎 |
| [leafer-x-ruler](https://github.com/LvHuaiSheng/leafer-x-ruler) 2.0 | 标尺线插件 |
| React 19 | UI 框架 |
| TypeScript | 类型安全 |
| Vite 8 | 构建工具 |

## 项目结构

```
src/
├── main.tsx                  # 应用入口
├── App.tsx                   # 根组件（Hash 路由）
├── style.css                 # 应用样式
├── styles/global.css         # 全局样式与 CSS 变量
├── constants/index.ts        # 常量配置（画布尺寸、路由、AI 预设）
├── types/index.ts            # TypeScript 类型定义
├── templates/index.ts        # 6 款简历模板
├── shapes/index.ts           # 图形元素定义
├── canvas/manager.ts         # 画布管理器（核心业务逻辑）
├── ai/assistant.ts           # AI 文本助手
├── utils/ui.ts               # UI 工具函数
└── pages/
    ├── home/
    │   ├── index.tsx          # 首页（模板展示）
    │   └── preview.tsx        # 全屏预览弹窗
    └── editor/
        ├── index.tsx          # 编辑器主页面
        ├── topbar.tsx         # 顶部栏（模板切换、缩放、导出）
        ├── toolbar.tsx        # 左侧工具栏（图形选择）
        ├── property-panel.tsx # 右侧属性面板
        └── ai-bubble.tsx      # AI 助手浮窗
```

## 画布架构

采用 LeaferJS App 三层渲染架构：

```
ground 层（背景层）
├── 点阵网格背景

tree 层（内容层）
├── 简历模板
├── 用户添加的图形和文本

sky 层（天空层）
└── Editor 实例（元素选择与编辑控制）
```

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm（推荐）

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 预览构建结果

```bash
pnpm preview
```

## 快捷操作

| 快捷键 | 功能 |
|--------|------|
| `Delete` / `Backspace` | 删除选中元素 |
| `Escape` | 取消选择 / 退出绘制模式 |
| 滚轮 | 缩放画布 |
| 拖拽空白区域 | 平移画布 |
| 双击文本 | 进入文本编辑 |

## License

MIT
