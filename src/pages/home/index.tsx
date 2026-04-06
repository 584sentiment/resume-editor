import { createElement, Fragment } from '../../jsx/index.js';
import { templates } from '../../templates/index.js';
import { renderPreviewModal, renderFullscreenPreview, cleanupPreview } from './preview.js';

export function renderHomePage(container: HTMLElement): void {
  const root = (
    <>
      {renderNav()}
      {renderHero()}
      {renderFeatures()}
      {renderTemplates()}
      {renderDemos()}
      {renderFooter()}
      {renderPreviewModal()}
    </>
  );

  container.innerHTML = '';
  container.appendChild(root);

  bindHomeEvents(container);
}

/** 渲染导航栏 */
function renderNav(): Element {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="nav-brand">
          <svg className="nav-logo" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#2563EB" />
            <path d="M8 10h6v12H8V10zm10 0h6v8h-6v-10z" fill="#fff" opacity="0.9" />
          </svg>
          <span className="nav-title">ResumeCraft</span>
        </div>
        <div className="nav-links">
          <a href="#features">功能</a>
          <a href="#templates">模板</a>
          <a href="#demos">案例</a>
        </div>
        <button className="btn btn-primary btn-nav" id="nav-start-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          开始创作
        </button>
      </div>
    </nav>
  );
}

/** 渲染 Hero 区域 */
function renderHero(): Element {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-badge">AI 驱动的简历设计工具</div>
        <h1 className="hero-title">
          用创意画布<br />
          <span className="hero-gradient">打造你的专属简历</span>
        </h1>
        <p className="hero-desc">
          基于 LeaferJS 的无限画布编辑器，提供丰富的几何图形和简历装饰元素。
          拖拽组合，自由排版，让每一份简历都独一无二。
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" id="hero-start-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
            免费开始设计
          </button>
          <button className="btn btn-outline btn-lg" id="hero-demo-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            了解更多
          </button>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-value">6+</span>
            <span className="stat-label">精选模板</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">20+</span>
            <span className="stat-label">图形元素</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">AI</span>
            <span className="stat-label">智能优化</span>
          </div>
        </div>
      </div>
      <div className="hero-visual">
        <div className="hero-canvas-preview">
          <div className="preview-mockup">
            <div className="preview-sidebar" />
            <div className="preview-content">
              <div className="preview-line w-40" />
              <div className="preview-line w-60" />
              <div className="preview-line w-80" />
              <div className="preview-spacer" />
              <div className="preview-line w-50" />
              <div className="preview-line w-70" />
              <div className="preview-line w-40" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** 渲染功能区域 */
function renderFeatures(): Element {
  const features = [
    {
      iconChildren: [
        <rect x="3" y="3" width="18" height="18" rx="2" />,
        <path d="M3 9h18M9 21V9" />,
      ],
      iconBg: '#DBEAFE',
      iconColor: '#2563EB',
      title: '无限画布',
      desc: '自由缩放平移的无限画布，搭配优雅的点阵背景，让你的创意不受限制',
    },
    {
      iconChildren: [
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
      ],
      iconBg: '#FFF7ED',
      iconColor: '#F97316',
      title: '丰富图形库',
      desc: '内置几何图形、装饰元素和简历专用组件，拖拽即可使用',
    },
    {
      iconChildren: [
        <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />,
        <polyline points="14 2 14 8 20 8" />,
      ],
      iconBg: '#F5F3FF',
      iconColor: '#7C3AED',
      title: '精选模板',
      desc: '多种风格的专业简历模板，一键切换主题色，快速开始你的设计',
    },
    {
      iconChildren: [
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />,
        <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />,
      ],
      iconBg: '#ECFDF5',
      iconColor: '#059669',
      title: 'AI 智能优化',
      desc: '选中文本后，AI 助手自动提供内容重写和优化建议',
    },
  ];

  return (
    <section className="features" id="features">
      <div className="section-header">
        <h2 className="section-title">核心功能</h2>
        <p className="section-desc">专为创意简历设计打造的专业编辑器</p>
      </div>
      <div className="features-grid">
        {features.map(f => (
          <div className="feature-card">
            <div className="feature-icon" style={`background: ${f.iconBg};`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={f.iconColor} stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                {f.iconChildren}
              </svg>
            </div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** 渲染模板区域 */
function renderTemplates(): Element {
  return (
    <section className="templates-section" id="templates">
      <div className="section-header">
        <h2 className="section-title">精选模板</h2>
        <p className="section-desc">选择一个模板开始你的创意之旅</p>
      </div>
      <div className="templates-grid" id="templates-grid">
        {templates.map((t, i) => (
          <div className="template-card" data-template={t.id} data-index={String(i)}>
            <div className="template-preview" style={`background: ${t.preview};`}>
              <div className="template-overlay">
                <button className="btn btn-white btn-sm template-preview-btn" data-index={String(i)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  预览
                </button>
              </div>
            </div>
            <div className="template-info">
              <h4>{t.name}</h4>
              <p>{t.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** 渲染 Demo 展示区域 */
function renderDemos(): Element {
  return (
    <section className="demo-section" id="demos">
      <div className="section-header">
        <h2 className="section-title">创意简历展示</h2>
        <p className="section-desc">查看使用 ResumeCraft 制作的创意简历</p>
      </div>
      <div className="demo-showcase">
        {templates.slice(0, 3).map((t, i) => (
          <div className="demo-card" data-demo={t.id} data-index={String(i)}>
            <div className="demo-preview" style={`background: ${t.preview};`}>
              <div className="demo-overlay">
                <button className="btn btn-white demo-fullscreen-btn" data-index={String(i)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                  全屏预览
                </button>
              </div>
            </div>
            <h4>{t.name}</h4>
          </div>
        ))}
      </div>
    </section>
  );
}

/** 渲染页脚 */
function renderFooter(): Element {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <svg className="nav-logo" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#2563EB" />
            <path d="M8 10h6v12H8V10zm10 0h6v8h-6v-10z" fill="#fff" opacity="0.9" />
          </svg>
          <span>ResumeCraft</span>
        </div>
        <p className="footer-copy">基于 LeaferJS 构建的创意简历编辑器</p>
      </div>
    </footer>
  );
}

/** 绑定首页事件 */
function bindHomeEvents(container: HTMLElement): void {
  // 导航到编辑器
  ['nav-start-btn', 'hero-start-btn'].forEach(id => {
    container.querySelector(`#${id}`)?.addEventListener('click', () => {
      window.location.hash = '#editor';
    });
  });

  // 平滑滚动
  container.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
      if (href) {
        container.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // 全屏预览
  const modal = container.querySelector('#fullscreen-modal') as HTMLElement;
  const fullscreenCanvas = container.querySelector('#fullscreen-canvas') as HTMLElement;
  const fullscreenTitle = container.querySelector('#fullscreen-title');
  let previewTemplateIndex = 0;

  function openPreview(index: number): void {
    previewTemplateIndex = index;
    const template = templates[index];
    if (fullscreenTitle) fullscreenTitle.textContent = template.name + ' - 预览';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderFullscreenPreview(fullscreenCanvas, template);
  }

  function closePreview(): void {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    cleanupPreview(fullscreenCanvas);
  }

  // 预览按钮 & 卡片点击
  container.querySelectorAll('.template-preview-btn, .demo-fullscreen-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openPreview(parseInt((e.currentTarget as HTMLElement).dataset.index || '0'));
    });
  });

  container.querySelectorAll('.template-card, .demo-card').forEach(card => {
    card.addEventListener('click', () => {
      openPreview(parseInt((card as HTMLElement).dataset.index || '0'));
    });
  });

  // 关闭预览
  container.querySelector('#fullscreen-backdrop')?.addEventListener('click', closePreview);
  container.querySelector('#fullscreen-close-btn')?.addEventListener('click', closePreview);
  container.querySelector('#fullscreen-edit-btn')?.addEventListener('click', () => {
    closePreview();
    window.location.hash = `#editor?template=${previewTemplateIndex}`;
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closePreview();
    }
  });
}
