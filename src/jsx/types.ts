/** JSX 类型声明 */

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: Record<string, unknown>;
    }

    type Element = globalThis.Element;
  }
}
