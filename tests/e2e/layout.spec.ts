import { test, expect } from '@playwright/test';

// 部署地址
const DEPLOY_URL = 'http://124.220.83.152';

test.describe('布局和样式验证', () => {
  test('1. 首页布局验证', async ({ page }) => {
    // 打开首页
    await page.goto(DEPLOY_URL);
    await page.waitForLoadState('networkidle');

    // 截图保存首页全屏
    await page.screenshot({
      path: './artifacts/homepage-full.png',
      fullPage: true
    });

    // 验证导航栏
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // 验证 Logo
    const logo = page.locator('nav svg + span');
    await expect(logo).toContainText('ResumeCraft');

    // 验证主标题
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    const h1Text = await h1.textContent();
    console.log('H1 内容:', h1Text);

    // 验证功能区域
    const featuresSection = page.locator('#features');
    await expect(featuresSection).toBeVisible();

    // 验证模板区域
    const templatesSection = page.locator('#templates');
    await expect(templatesSection).toBeVisible();

    // 验证 Footer
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // 截图功能区域
    await featuresSection.screenshot({
      path: './artifacts/homepage-features.png'
    });

    // 截图模板区域
    await templatesSection.screenshot({
      path: './artifacts/homepage-templates.png'
    });

    console.log('首页截图已保存到 ./artifacts/');
  });

  test('2. 编辑器页面布局验证', async ({ page }) => {
    // 打开编辑器页面
    await page.goto(`${DEPLOY_URL}/editor`);
    await page.waitForLoadState('networkidle');

    // 等待编辑器加载完成（动态导入的组件）
    await page.waitForTimeout(5000);

    // 截图保存编辑器页面
    await page.screenshot({
      path: './artifacts/editor-page.png',
      fullPage: false
    });

    // 验证画布容器存在
    const canvasWrapper = page.locator('#editor-canvas-wrapper');
    await expect(canvasWrapper).toBeVisible();

    // 截图画布区域
    await canvasWrapper.screenshot({
      path: './artifacts/editor-canvas.png'
    });

    console.log('编辑器截图已保存到 ./artifacts/');
  });

  test('3. 验证响应式布局 - 移动端', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });

    // 打开首页
    await page.goto(DEPLOY_URL);
    await page.waitForLoadState('networkidle');

    // 截图移动端首页
    await page.screenshot({
      path: './artifacts/homepage-mobile.png',
      fullPage: true
    });

    console.log('移动端截图已保存到 ./artifacts/');
  });
});
