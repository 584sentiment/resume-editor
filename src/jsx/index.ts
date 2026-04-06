/** 自定义 JSX Factory - 直接创建真实 DOM 元素，无需虚拟 DOM 框架 */

type Child = Element | string | number | boolean | null | undefined;
type Props = Record<string, unknown>;

export function createElement(
  tag: string | ((props: Props) => Element),
  props: Props | null,
  ...children: Child[]
): Element {
  // 函数式组件（Fragment 等）
  if (typeof tag === 'function') {
    // 合并 props.children（来自 JSX 表达式）和 rest children
    const merged = props?.children != null
      ? [...(Array.isArray(props.children) ? props.children : [props.children]), ...children]
      : children;
    return tag({ ...(props ?? {}), children: merged });
  }

  const el = tag === 'svg' || tag === 'path' || tag === 'circle' || tag === 'rect' ||
             tag === 'line' || tag === 'polyline' || tag === 'polygon' ||
             tag === 'ellipse' || tag === 'g' || tag === 'defs' ||
             tag === 'clipPath' || tag === 'use' || tag === 'text'
    ? document.createElementNS('http://www.w3.org/2000/svg', tag)
    : document.createElement(tag);

  // 设置属性
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (key === 'children' || value == null) continue;

      // dangerouslySetInnerHTML
      if (key === 'dangerouslySetInnerHTML' && typeof value === 'object' && value !== null && '__html' in value) {
        el.innerHTML = (value as { __html: string }).__html;
        continue;
      }

      // 事件绑定 (onClick → click)
      if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.slice(2).toLowerCase();
        el.addEventListener(eventName, value as EventListener);
        continue;
      }

      // style 对象
      if (key === 'style' && typeof value === 'object') {
        Object.assign(el.style, value);
        continue;
      }

      // SVG 元素必须用 setAttribute
      if (el instanceof SVGElement) {
        el.setAttribute(key, String(value));
      } else {
        // HTML 元素：class 属性用 className
        if (key === 'className') {
          (el as HTMLElement).className = String(value);
        } else if (typeof value === 'boolean') {
          // checked, disabled 等布尔属性
          (el as unknown as Record<string, unknown>)[key] = value;
        } else {
          (el as HTMLElement).setAttribute(key, String(value));
        }
      }
    }
  }

  // 递归添加子元素
  appendChildren(el, children);

  return el;
}

function appendChildren(parent: Element, children: unknown[]): void {
  for (const child of children) {
    if (child == null || typeof child === 'boolean') continue;
    if (typeof child === 'string' || typeof child === 'number') {
      parent.appendChild(document.createTextNode(String(child)));
    } else if (child instanceof Element) {
      parent.appendChild(child);
    } else if (Array.isArray(child)) {
      appendChildren(parent, child);
    }
  }
}

/** JSX Fragment 支持 <></> */
export function Fragment(props: { children?: unknown }): Element {
  const el = document.createElement('div');
  el.style.display = 'contents';
  const children = (props as Record<string, unknown>).children;
  if (Array.isArray(children)) {
    appendChildren(el, children);
  } else if (children instanceof Element) {
    el.appendChild(children);
  }
  return el;
}
