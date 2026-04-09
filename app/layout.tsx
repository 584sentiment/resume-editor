import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ResumeCraft - 创意简历编辑器 | 免费在线简历设计工具',
  description: '基于 LeaferJS 的无限画布编辑器，提供丰富的几何图形和简历装饰元素。拖拽组合，自由排版，让每一份简历都独一无二。',
  keywords: '简历编辑器,创意简历,在线简历设计,简历模板,免费简历制作,简历设计工具',
  openGraph: {
    title: 'ResumeCraft - 创意简历编辑器',
    description: 'AI 驱动的简历设计工具，基于 LeaferJS 的无限画布编辑器',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-slate-50 text-slate-800">
        <div id="app">{children}</div>
      </body>
    </html>
  );
}
