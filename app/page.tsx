'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { templates } from '@/lib/templates/index';
import { PreviewModal } from './components/PreviewModal';

export default function HomePage() {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const router = useRouter();

  const openPreview = useCallback((index: number) => {
    setPreviewIndex(index);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewIndex(null);
  }, []);

  const goToEditor = useCallback((index: number) => {
    setPreviewIndex(null);
    router.push('/editor?template=' + index);
  }, [router]);

  const handleEdit = useCallback(() => {
    if (previewIndex !== null) {
      goToEditor(previewIndex);
    }
  }, [previewIndex, goToEditor]);

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#2563EB" />
              <path d="M8 10h6v12H8V10zm10 0h6v8h-6v-10z" fill="#fff" opacity="0.9" />
            </svg>
            <span className="text-xl font-bold text-slate-800">ResumeCraft</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">功能</Link>
            <Link href="#templates" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">模板</Link>
            <Link href="#demos" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">案例</Link>
          </div>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
            onClick={() => router.push('/editor')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            开始创作
          </button>
        </div>
      </nav>

      <section className="min-h-screen flex items-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* 左侧文字内容 */}
            <div className="flex-1 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                AI 驱动的简历设计工具
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
                用创意画布<br />
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">打造你的专属简历</span>
              </h1>
              <p className="text-lg text-slate-600 mt-6 leading-relaxed">
                基于 LeaferJS 的无限画布编辑器，提供丰富的几何图形和简历装饰元素。
                拖拽组合，自由排版，让每一份简历都独一无二。
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-8">
                <button
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-hover transition-colors shadow-lg shadow-primary/25"
                  onClick={() => router.push('/editor')}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 3l14 9-14 9V3z" />
                  </svg>
                  免费开始设计
                </button>
                <button
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-xl font-medium hover:bg-primary/5 transition-colors"
                  onClick={() => document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  了解更多
                </button>
              </div>
              <div className="flex items-center gap-8 mt-12">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-slate-800">6+</span>
                  <span className="text-sm text-slate-500">精选模板</span>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-slate-800">20+</span>
                  <span className="text-sm text-slate-500">图形元素</span>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-slate-800">AI</span>
                  <span className="text-sm text-slate-500">智能优化</span>
                </div>
              </div>
            </div>
            {/* 右侧简历示意图 */}
            <div className="flex-shrink-0 w-full max-w-md">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ transform: 'perspective(1000px) rotateY(-5deg) rotateX(2deg)' }}>
                <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary" />
                    <div>
                      <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
                      <div className="h-3 w-24 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-full bg-slate-100 rounded" />
                    <div className="h-2 w-5/6 bg-slate-100 rounded" />
                    <div className="h-2 w-4/5 bg-slate-100 rounded" />
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <div className="h-3 w-20 bg-slate-200 rounded mb-3" />
                    <div className="h-2 w-full bg-slate-100 rounded mb-2" />
                    <div className="h-2 w-3/4 bg-slate-100 rounded" />
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <div className="h-3 w-24 bg-slate-200 rounded mb-3" />
                    <div className="flex gap-2">
                      <div className="h-8 w-8 rounded bg-blue-100" />
                      <div className="h-8 w-8 rounded bg-orange-100" />
                      <div className="h-8 w-8 rounded bg-green-100" />
                      <div className="h-8 w-8 rounded bg-purple-100" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">核心功能</h2>
            <p className="text-slate-600 mt-3">专为创意简历设计打造的专业编辑器</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                iconChildren: [
                  <rect key="r" x="3" y="3" width="18" height="18" rx="2" />,
                  <path key="p" d="M3 9h18M9 21V9" />,
                ],
                iconBg: '#DBEAFE',
                iconColor: '#2563EB',
                title: '无限画布',
                desc: '自由缩放平移的无限画布，搭配优雅的点阵背景，让你的创意不受限制',
              },
              {
                iconChildren: [
                  <path key="p" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
                ],
                iconBg: '#FFF7ED',
                iconColor: '#F97316',
                title: '丰富图形库',
                desc: '内置几何图形、装饰元素和简历专用组件，拖拽即可使用',
              },
              {
                iconChildren: [
                  <path key="p" d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />,
                  <polyline key="pl" points="14 2 14 8 20 8" />,
                ],
                iconBg: '#F5F3FF',
                iconColor: '#7C3AED',
                title: '精选模板',
                desc: '多种风格的专业简历模板，一键切换主题色，快速开始你的设计',
              },
              {
                iconChildren: [
                  <path key="p1" d="M12 2a10 10 0 100 20 10 10 0 000-20z" />,
                  <path key="p2" d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />,
                ],
                iconBg: '#ECFDF5',
                iconColor: '#059669',
                title: 'AI 智能优化',
                desc: '选中文本后，AI 助手自动提供内容重写和优化建议',
              },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2.5 hover:border-primary border border-slate-100 cursor-pointer">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: f.iconBg }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={f.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {f.iconChildren}
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{f.title}</h3>
                <p className="text-slate-600 mt-2 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50" id="templates">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">精选模板</h2>
            <p className="text-slate-600 mt-3">选择一个模板开始你的创意之旅</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((t, i) => (
              <div key={t.id} className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer" onClick={() => openPreview(i)}>
                <div className="h-48 relative" style={{ background: t.preview }}>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <button
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-800 rounded-lg font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); openPreview(i); }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      预览
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-slate-900">{t.name}</h4>
                  <p className="text-slate-500 text-sm mt-1">{t.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white" id="demos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">创意简历展示</h2>
            <p className="text-slate-600 mt-3">查看使用 ResumeCraft 制作的创意简历</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.slice(0, 3).map((t, i) => (
              <div key={t.id} className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer" onClick={() => openPreview(i)}>
                <div className="h-64 relative" style={{ background: t.preview }}>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <button
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-800 rounded-lg font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); openPreview(i); }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                      </svg>
                      全屏预览
                    </button>
                  </div>
                </div>
                <h4 className="p-4 font-semibold text-slate-900">{t.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#2563EB" />
                <path d="M8 10h6v12H8V10zm10 0h6v8h-6v-10z" fill="#fff" opacity="0.9" />
              </svg>
              <span className="text-lg font-bold">ResumeCraft</span>
            </div>
            <p className="text-slate-400 text-sm">基于 LeaferJS 构建的创意简历编辑器</p>
          </div>
        </div>
      </footer>

      <PreviewModal
        isOpen={previewIndex !== null}
        template={previewIndex !== null ? templates[previewIndex] : null}
        onClose={closePreview}
        onEdit={handleEdit}
      />
    </>
  );
}
