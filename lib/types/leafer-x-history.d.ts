declare module 'leafer-x-history' {
  import type { ILeafer } from '@leafer-ui/interface';

  export interface HistoryPluginConfig {
    maxSize?: number;
    type?: string;
  }

  export interface IPlugin {
    name: string;
    run(LeaferUI: unknown, config?: HistoryPluginConfig): void;
    onLeafer(leafer: ILeafer): void;
  }

  export const historyPlugin: IPlugin;
  export function createSnapshot(leafer: ILeafer): void;
  export function undoLeafer(leafer: ILeafer): boolean;
  export function redoLeafer(leafer: ILeafer): boolean;
  export function clearHistory(leafer: ILeafer): Promise<void>;

  export interface HistoryEvent<T = unknown> {
    type: 'push' | 'undo' | 'redo' | 'clear' | 'error';
    snapshot?: T;
    index?: number;
    error?: Error;
  }

  export class HistoryManager<T = unknown> {
    get canUndo(): boolean;
    get canRedo(): boolean;
    get size(): number;
    get index(): number;
    push(snapshot: T): Promise<void>;
    undo(): T | null;
    redo(): T | null;
    clear(): Promise<void>;
    on(event: string, listener: (event: HistoryEvent<T>) => void): () => void;
    off(event: string, listener: (event: HistoryEvent<T>) => void): void;
  }

  export function getHistoryManager(leafer: ILeafer): HistoryManager | undefined;
}
