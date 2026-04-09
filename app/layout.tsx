import type { Metadata } from 'next';
import './globals.css';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'ResumeCraft - 创意简历编辑器',
  description: 'AI 驱动的简历设计工具，基于 LeaferJS 的无限画布编辑器',
  url: 'https://124.220.83.152',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'CNY',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '126',
  },
};

export const metadata: Metadata = {
  title: 'ResumeCraft - 创意简历编辑器 | 免费在线简历设计工具',
  description: '基于 LeaferJS 的无限画布编辑器，提供丰富的几何图形和简历装饰元素。拖拽组合，自由排版，让每一份简历都独一无二。',
  keywords: '简历编辑器,创意简历,在线简历设计,简历模板,免费简历制作,简历设计工具',
  authors: [{ name: 'ResumeCraft' }],
  openGraph: {
    title: 'ResumeCraft - 创意简历编辑器',
    description: 'AI 驱动的简历设计工具，基于 LeaferJS 的无限画布编辑器',
    type: 'website',
    locale: 'zh_CN',
    siteName: 'ResumeCraft',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ResumeCraft - 创意简历编辑器',
    description: 'AI 驱动的简历设计工具，基于 LeaferJS 的无限画布编辑器',
    creator: '@ResumeCraft',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased bg-slate-50 text-slate-800">
        <div id="app">{children}</div>
      </body>
    </html>
  );
}
