import type { AIAction } from '@/lib/types/index';
import { AI_REWRITE_MAP, AI_OPTIMIZE_MAP } from '@/lib/constants/index';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyElement = any;

/** AI 写作助手 */
export class AIAssistant {
  /**
   * 执行 AI 操作
   * @returns 操作结果消息
   */
  execute(element: AnyElement, action: AIAction): string {
    const originalText = element.text || '';
    const map = action === 'rewrite' ? AI_REWRITE_MAP : AI_OPTIMIZE_MAP;
    const fallback = action === 'rewrite' ? 'AI 重写: ' : '优化后: ';

    const newText = map[originalText] || `${fallback}${originalText}`;

    if (element.text !== undefined) {
      element.text = newText;
    }

    return action === 'rewrite' ? '内容已重新撰写' : '内容已优化';
  }

  /** 检查元素是否包含可编辑文本 */
  static isTextElement(element: AnyElement): boolean {
    if (!element) return false;
    return element.tag === 'Text' ||
      (element.children?.some((c: AnyElement) => c.tag === 'Text'));
  }
}
