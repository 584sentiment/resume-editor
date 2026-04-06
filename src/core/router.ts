import { ROUTES } from '../constants/index.js';

export type RouteHandler = (params: Record<string, string>) => void;

interface Route {
  pattern: string | RegExp;
  handler: RouteHandler;
}

/** 轻量级 hash 路由 */
export class Router {
  private routes: Route[] = [];

  /** 注册路由 */
  add(pattern: string | RegExp, handler: RouteHandler): this {
    this.routes.push({ pattern, handler });
    return this;
  }

  /** 启动路由监听 */
  start(): void {
    window.addEventListener('hashchange', () => this.resolve());
    this.resolve();
  }

  /** 手动导航 */
  navigate(hash: string): void {
    window.location.hash = hash;
  }

  /** 解析当前路由 */
  private resolve(): void {
    const hash = window.location.hash || ROUTES.HOME;

    for (const route of this.routes) {
      if (typeof route.pattern === 'string') {
        if (hash.startsWith(route.pattern)) {
          const params = this.parseQuery(hash);
          route.handler(params);
          return;
        }
      } else if (route.pattern.test(hash)) {
        const params = this.parseQuery(hash);
        route.handler(params);
        return;
      }
    }
  }

  /** 解析查询参数 */
  private parseQuery(hash: string): Record<string, string> {
    const queryStr = hash.split('?')[1] || '';
    const searchParams = new URLSearchParams(queryStr);
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }
}
