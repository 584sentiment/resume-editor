import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径 (ES Module)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 测试简历导出功能 - 验证 A4 纸张尺寸
test.describe('简历导出功能测试', () => {
  const EXPORT_DIR = path.join(__dirname, '..', '..', 'artifacts');
  const EXPECTED_PNG_WIDTH = 1300;  // 650 * 2 (pixelRatio: 2)
  const EXPECTED_PNG_HEIGHT = 1838; // 919 * 2

  test.beforeAll(async () => {
    // 创建导出目录
    if (!fs.existsSync(EXPORT_DIR)) {
      fs.mkdirSync(EXPORT_DIR, { recursive: true });
    }
  });

  // 辅助函数：进入编辑器
  async function gotoEditor(page: any) {
    // 打开首页
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 点击第一个模板进入预览
    const templateCards = page.locator('.template-card');
    await templateCards.first().click();

    // 等待预览弹窗出现
    await page.waitForSelector('.fullscreen-modal', { timeout: 10000 });

    // 点击进入编辑按钮
    const editButton = page.locator('.fullscreen-modal .btn-primary');
    await editButton.click();

    // 等待编辑器页面加载
    await page.waitForURL(/editor/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // 等待画布加载完成
    await page.waitForSelector('#editor-canvas', { timeout: 10000 });

    // 额外等待让 Leafer 画布完全初始化
    await page.waitForTimeout(3000);
  }

  test('1. 首页加载并进入编辑页面', async ({ page }) => {
    // 打开首页
    await page.goto('/');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 截图保存首页
    await page.screenshot({ path: path.join(EXPORT_DIR, '01-homepage.png') });

    // 点击第一个模板进入预览
    const templateCards = page.locator('.template-card');
    await expect(templateCards.first()).toBeVisible();
    await templateCards.first().click();

    // 等待预览弹窗出现
    await page.waitForSelector('.fullscreen-modal', { timeout: 10000 });

    // 截图预览弹窗
    await page.screenshot({ path: path.join(EXPORT_DIR, '02-preview-modal.png') });

    // 点击进入编辑按钮
    const editButton = page.locator('.fullscreen-modal .btn-primary');
    await expect(editButton).toBeVisible();
    await editButton.click();

    // 等待编辑器页面加载
    await page.waitForURL(/editor/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // 等待画布加载完成
    await page.waitForSelector('#editor-canvas', { timeout: 10000 });

    // 额外等待让 Leafer 画布完全初始化
    await page.waitForTimeout(3000);

    // 截图保存编辑器页面
    await page.screenshot({ path: path.join(EXPORT_DIR, '03-editor-page.png') });
  });

  test('2. 导出 PNG 并验证尺寸 (1300x1838)', async ({ page }) => {
    // 进入编辑器
    await gotoEditor(page);

    // 截图编辑器状态
    await page.screenshot({ path: path.join(EXPORT_DIR, '04-before-export.png') });

    // 点击导出按钮
    const exportButton = page.locator('#export-btn');
    await expect(exportButton).toBeVisible();
    await exportButton.click();

    // 等待导出菜单出现
    const exportMenu = page.locator('.export-menu');
    await expect(exportMenu).toBeVisible();

    // 监听下载事件
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 30000 }),
      // 点击 PNG 导出选项
      exportMenu.locator('button:has-text("PNG")').click(),
    ]);

    // 保存 PNG 文件
    const pngPath = path.join(EXPORT_DIR, 'resume-export.png');
    await download.saveAs(pngPath);

    // 验证文件存在
    expect(fs.existsSync(pngPath)).toBeTruthy();

    // 读取 PNG 文件并验证尺寸
    const fileSize = fs.statSync(pngPath).size;
    console.log(`PNG 文件大小: ${fileSize} bytes`);

    // 读取 PNG 尺寸
    const pngBuffer = fs.readFileSync(pngPath);
    const dimensions = getPngDimensions(pngBuffer);

    console.log(`PNG 实际尺寸: ${dimensions.width}x${dimensions.height}`);
    console.log(`PNG 期望尺寸: ${EXPECTED_PNG_WIDTH}x${EXPECTED_PNG_HEIGHT}`);

    // 验证尺寸
    expect(dimensions.width).toBe(EXPECTED_PNG_WIDTH);
    expect(dimensions.height).toBe(EXPECTED_PNG_HEIGHT);
  });

  test('3. 导出 PDF 并验证内容填充', async ({ page }) => {
    // 进入编辑器
    await gotoEditor(page);

    // 截图编辑器状态
    await page.screenshot({ path: path.join(EXPORT_DIR, '06-pdf-before-export.png') });

    // 点击导出按钮
    const exportButton = page.locator('#export-btn');
    await expect(exportButton).toBeVisible();
    await exportButton.click();

    // 等待导出菜单出现
    const exportMenu = page.locator('.export-menu');
    await expect(exportMenu).toBeVisible();

    // 监听下载事件
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 30000 }),
      // 点击 PDF 导出选项
      exportMenu.locator('button:has-text("PDF")').click(),
    ]);

    // 保存 PDF 文件
    const pdfPath = path.join(EXPORT_DIR, 'resume-export.pdf');
    await download.saveAs(pdfPath);

    // 验证文件存在
    expect(fs.existsSync(pdfPath)).toBeTruthy();

    // 读取 PDF 文件并验证
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfSize = pdfBuffer.length;

    console.log(`PDF 文件大小: ${pdfSize} bytes`);

    // PDF 文件应该有合理的大小（不是空文件）
    // A4 PDF 通常在 10KB - 500KB 之间，取决于图片内容
    expect(pdfSize).toBeGreaterThan(5000); // 至少 5KB
    expect(pdfSize).toBeLessThan(5000000); // 不超过 5MB

    // 验证 PDF 文件头（应该有 PDF 标识）
    const pdfHeader = pdfBuffer.slice(0, 5).toString();
    expect(pdfHeader).toBe('%PDF-');

    // 截图保存导出后的页面状态
    await page.screenshot({ path: path.join(EXPORT_DIR, '07-after-export.png') });
  });
});

// 辅助函数：读取 PNG 文件的尺寸
function getPngDimensions(buffer: Buffer): { width: number; height: number } {
  // PNG 文件头: 89 50 4E 47 0D 0A 1A 0A
  // 尺寸在第 17-24 字节 (宽度4字节 + 高度4字节)
  // 使用 Big Endian 格式
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}
