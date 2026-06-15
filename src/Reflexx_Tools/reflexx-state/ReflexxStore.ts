// ReflexxStore.ts - Core store optimized for high-performance and scale

import {
  Listener,
  SetStateAction,
  Version,
  StoreConfig,
  PersistConfig,
  HistoryInfo,
} from './types';
import { IndexedDBHelper } from './indexedDB';

// ============ IMMUTABILITY UTILITIES (PERFORMANCE OPTIMIZED) ============

function createImmutableProxy<T extends object>(
  obj: T,
  path: string = 'state',
): T {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (value !== null && typeof value === 'object') {
        return createImmutableProxy(value, `${path}.${String(prop)}`);
      }
      return value;
    },
    set(target, prop, value, receiver) {
      const errorMessage =
        `🔒 Reflexx_State: Cannot mutate state directly at '${path}.${String(prop)}'.\n\n` +
        `❌ Wrong: user.name = 'John'\n` +
        `✅ Correct: setState({ user: { ...user, name: 'John' } })\n` +
        `✅ Or: setState((state) => ({ ...state, user: { ...state.user, name: 'John' } }))`;

      throw new Error(errorMessage);
    },
    deleteProperty(target, prop) {
      throw new Error(
        `🔒 Reflexx_State: Cannot delete property '${String(prop)}' directly.`,
      );
    },
    defineProperty(target, prop, descriptor) {
      throw new Error(
        `🔒 Reflexx_State: Cannot define property '${String(prop)}' directly.`,
      );
    },
  });
}

export class ReflexxStore<T extends object> {
  private internalState: T;
  private exposedState: T;
  private listeners = new Set<Listener<T>>();
  public name: string;
  public devtools: boolean;
  private isDevelopment: boolean;

  private past: Version<T>[] = [];
  private present!: Version<T>;
  private future: Version<T>[] = [];
  private historyConfig: Required<
    Omit<NonNullable<StoreConfig<T>['history']>, 'autoClearMs'>
  > & { autoClearMs: number };

  private isUndoRedo = false;
  private isBatching = false;

  private debounceTimer?: ReturnType<typeof setTimeout>;
  private pendingUpdate?: { updater: SetStateAction<T>; action?: string };
  private autoClearInterval?: ReturnType<typeof setInterval>;

  private persistConfig?: PersistConfig;
  private indexedDBHelper?: IndexedDBHelper;

  // Hydration state tracking
  private isHydrated = false;
  public hydrationPromise: Promise<void> = Promise.resolve();

  constructor(initialState: T, config: StoreConfig<T> = {}) {
    // Structural Sharing baseline: store the reference or a single-top-level copy
    this.internalState = { ...initialState };
    this.isDevelopment =
      typeof globalThis !== 'undefined' &&
      'process' in globalThis &&
      (globalThis as any).process?.env?.NODE_ENV !== 'production';

    // Only apply heavy safety proxies in development mode. In production, pass raw reference.
    this.exposedState = this.isDevelopment
      ? createImmutableProxy(this.internalState)
      : this.internalState;

    this.name = config.name || 'ReflexxStore';
    this.devtools = config.devtools || false;
    this.persistConfig = config.persist;

    const history = config.history || {};
    this.historyConfig = {
      maxVersions: history.maxVersions ?? 50,
      debounceTime: history.debounceTime ?? 0,
      ignoreIdentical: history.ignoreIdentical ?? true,
      autoClearMs: history.autoClearMs ?? 0,
    };

    this.initializeHistory(this.internalState, 'initial');

    if (this.persistConfig?.storage === 'indexedDB') {
      const dbName = this.persistConfig.dbName || 'ReflexxStore';
      const storeName = this.persistConfig.storeName || 'states';
      const version = this.persistConfig.version || 1;
      this.indexedDBHelper = new IndexedDBHelper(dbName, storeName, version);
    }

    if (this.persistConfig) {
      // Expose the promise chain so hooks can look at the initialization status
      this.hydrationPromise = this.loadFromStorage().then(() => {
        this.isHydrated = true;
        this.exposedState = this.isDevelopment
          ? createImmutableProxy(this.internalState)
          : this.internalState;

        this.initializeHistory(this.internalState, 'hydrated');
        this.listeners.forEach((listener) =>
          listener(this.exposedState, this.internalState),
        );
      });
    } else {
      this.isHydrated = true;
    }

    if (this.historyConfig.autoClearMs > 0) {
      this.startAutoClear();
    }
  }

  private initializeHistory(state: T, action: string) {
    this.present = {
      id: this.generateId(),
      state: { ...state }, // Top-level structural break for history baseline
      timestamp: Date.now(),
      action,
      changes: { ...state } as Partial<T>,
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  public hasHydrated(): boolean {
    return this.isHydrated;
  }

  private async loadFromStorage(): Promise<void> {
    if (!this.persistConfig) return;

    try {
      let parsed: Partial<T> | null = null;

      if (this.persistConfig.storage === 'indexedDB' && this.indexedDBHelper) {
        const data = await this.indexedDBHelper.getItem<any>(
          this.persistConfig.key,
        );
        if (data) parsed = data;
      } else {
        const saved = localStorage.getItem(this.persistConfig.key);
        if (saved) parsed = JSON.parse(saved) as Partial<T>;
      }

      if (parsed) {
        let updatedState = { ...this.internalState };

        if (
          this.persistConfig.whitelist &&
          this.persistConfig.whitelist.length > 0
        ) {
          this.persistConfig.whitelist.forEach((key) => {
            if (key in parsed! && parsed![key as keyof T] !== undefined) {
              (updatedState as any)[key] = parsed![key as keyof T];
            }
          });
        } else if (
          this.persistConfig.blacklist &&
          this.persistConfig.blacklist.length > 0
        ) {
          Object.keys(parsed).forEach((key) => {
            if (!this.persistConfig!.blacklist!.includes(key)) {
              (updatedState as any)[key] = parsed![key as keyof T];
            }
          });
        } else {
          updatedState = { ...updatedState, ...parsed };
        }

        this.internalState = updatedState;
      }
    } catch (e) {
      console.warn(`Failed to load state for ${this.name}:`, e);
    }
  }

  private async saveToStorage(): Promise<void> {
    if (!this.persistConfig) return;

    try {
      let stateToSave: any = {};
      if (
        this.persistConfig.whitelist &&
        this.persistConfig.whitelist.length > 0
      ) {
        this.persistConfig.whitelist.forEach((key) => {
          if (key in this.internalState)
            stateToSave[key] = (this.internalState as any)[key];
        });
      } else if (
        this.persistConfig.blacklist &&
        this.persistConfig.blacklist.length > 0
      ) {
        stateToSave = { ...this.internalState };
        this.persistConfig.blacklist.forEach((key) => delete stateToSave[key]);
      } else {
        stateToSave = this.internalState;
      }

      if (this.persistConfig.storage === 'indexedDB' && this.indexedDBHelper) {
        await this.indexedDBHelper.setItem(this.persistConfig.key, stateToSave);
      } else {
        localStorage.setItem(
          this.persistConfig.key,
          JSON.stringify(stateToSave),
        );
      }
    } catch (e) {
      console.warn(`Failed to save state for ${this.name}:`, e);
    }
  }

  private startAutoClear(): void {
    const intervalMs = this.historyConfig.autoClearMs;
    if (intervalMs <= 0) return;
    this.autoClearInterval = setInterval(() => {
      const now = Date.now();
      this.past = this.past.filter((v) => now - v.timestamp < intervalMs);
      this.future = this.future.filter((v) => now - v.timestamp < intervalMs);
    }, intervalMs);
  }

  private addToHistory(newState: T, action?: string): void {
    if (this.isUndoRedo) return;
    const currentState = this.present.state;

    // Shallow check optimization over JSON stringify where applicable
    if (this.historyConfig.ignoreIdentical && currentState === newState) {
      return;
    }

    const changes: Partial<T> = {};
    const allKeys = new Set([
      ...Object.keys(currentState),
      ...Object.keys(newState),
    ]);

    for (const key of allKeys) {
      const oldValue = (currentState as any)[key];
      const newValue = (newState as any)[key];
      if (oldValue !== newValue) {
        (changes as any)[key] = newValue;
      }
    }

    const newVersion: Version<T> = {
      id: this.generateId(),
      state: { ...newState }, // Structural separation snapshot
      timestamp: Date.now(),
      action: action || 'update',
      changes,
    };

    this.past.push(this.present);
    while (this.past.length > this.historyConfig.maxVersions) {
      this.past.shift();
    }
    this.future = [];
    this.present = newVersion;
  }

  private async applyUpdate(
    newState: T,
    action?: string,
    prevStateBeforeBatch?: T,
  ): Promise<void> {
    const prevState = prevStateBeforeBatch || this.internalState;
    this.internalState = newState;

    this.exposedState = this.isDevelopment
      ? createImmutableProxy(this.internalState)
      : this.internalState;

    this.addToHistory(newState, action);

    if (this.persistConfig) await this.saveToStorage();

    if (this.devtools) {
      console.groupCollapsed(`📊 [${this.name}] State Update`);
      console.log('Action:', action || 'update');
      console.log('Previous:', prevState);
      console.log('Next:', this.internalState);
      console.groupEnd();
    }

    if (!this.isBatching) {
      this.listeners.forEach((listener) =>
        listener(this.exposedState, prevState),
      );
    }
  }

  public async batch(cb: () => void, batchActionName?: string): Promise<void> {
    if (this.isBatching) {
      cb();
      return;
    }
    const prevStateBeforeBatch = this.internalState;
    this.isBatching = true;
    try {
      cb();
    } finally {
      this.isBatching = false;
      await this.applyUpdate(
        this.internalState,
        batchActionName || 'BATCH_UPDATE',
        prevStateBeforeBatch,
      );
    }
  }

  getState = (): T => this.exposedState;

  setState = async (
    updater: SetStateAction<T>,
    action?: string,
  ): Promise<void> => {
    let newState: T;

    if (typeof updater === 'function') {
      const partial = (updater as Function)(this.internalState);
      newState = { ...this.internalState, ...partial };
    } else {
      newState = { ...this.internalState, ...updater };
    }

    if (this.historyConfig.debounceTime > 0 && !this.isBatching) {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.pendingUpdate = { updater, action };
      this.debounceTimer = setTimeout(async () => {
        if (this.pendingUpdate) {
          let finalState: T;
          if (typeof this.pendingUpdate.updater === 'function') {
            const partial = (this.pendingUpdate.updater as Function)(
              this.internalState,
            );
            finalState = { ...this.internalState, ...partial };
          } else {
            finalState = {
              ...this.internalState,
              ...this.pendingUpdate.updater,
            };
          }
          await this.applyUpdate(finalState, this.pendingUpdate.action);
          this.pendingUpdate = undefined;
        }
        this.debounceTimer = undefined;
      }, this.historyConfig.debounceTime);
    } else {
      await this.applyUpdate(newState, action);
    }
  };

  subscribe = (listener: Listener<T>): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  undo = async (): Promise<boolean> => {
    if (this.past.length === 0) return false;
    this.isUndoRedo = true;

    const previous = this.past.pop()!;
    this.future.unshift(this.present);
    this.present = previous;

    this.internalState = previous.state;
    this.exposedState = this.isDevelopment
      ? createImmutableProxy(this.internalState)
      : this.internalState;

    if (this.persistConfig) await this.saveToStorage();
    this.listeners.forEach((listener) =>
      listener(this.exposedState, previous.state),
    );

    this.isUndoRedo = false;
    return true;
  };

  redo = async (): Promise<boolean> => {
    if (this.future.length === 0) return false;
    this.isUndoRedo = true;

    const next = this.future.shift()!;
    this.past.push(this.present);
    this.present = next;

    this.internalState = next.state;
    this.exposedState = this.isDevelopment
      ? createImmutableProxy(this.internalState)
      : this.internalState;

    if (this.persistConfig) await this.saveToStorage();
    this.listeners.forEach((listener) =>
      listener(this.exposedState, next.state),
    );

    this.isUndoRedo = false;
    return true;
  };

  clearHistory = (keepCurrent: boolean = true): void => {
    this.past = [];
    this.future = [];
    if (!keepCurrent) {
      this.initializeHistory(this.internalState, 'reset');
    }
  };

  getHistoryInfo = (): HistoryInfo<T> => ({
    canUndo: this.past.length > 0,
    canRedo: this.future.length > 0,
    pastCount: this.past.length,
    futureCount: this.future.length,
    totalVersions: this.past.length + 1 + this.future.length,
    currentAction: this.present.action,
  });

  jumpToVersion = async (versionId: string): Promise<boolean> => {
    const pastIndex = this.past.findIndex((v) => v.id === versionId);
    if (pastIndex !== -1) {
      const targetVersion = this.past[pastIndex];
      const newPast = this.past.slice(0, pastIndex);
      const newFuture = [
        ...this.past.slice(pastIndex + 1),
        this.present,
        ...this.future,
      ];

      this.isUndoRedo = true;
      this.past = newPast;
      this.present = targetVersion;
      this.future = newFuture;

      this.internalState = targetVersion.state;
      this.exposedState = this.isDevelopment
        ? createImmutableProxy(this.internalState)
        : this.internalState;

      if (this.persistConfig) await this.saveToStorage();
      this.listeners.forEach((listener) =>
        listener(this.exposedState, targetVersion.state),
      );

      this.isUndoRedo = false;
      return true;
    }
    return false;
  };

  reset = async (newState?: T): Promise<void> => {
    this.internalState = newState ? { ...newState } : ({} as T);
    this.exposedState = this.isDevelopment
      ? createImmutableProxy(this.internalState)
      : this.internalState;
    this.clearHistory(false);

    if (this.persistConfig) await this.saveToStorage();
    this.listeners.forEach((listener) => listener(this.exposedState, {} as T));
  };

  destroy = (): void => {
    if (this.autoClearInterval) clearInterval(this.autoClearInterval);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.listeners.clear();
  };
}

const storeRegistry = new Map<string, ReflexxStore<any>>();

export function createStore<T extends object>(
  initialState: T,
  config?: StoreConfig<T>,
): ReflexxStore<T> {
  const store = new ReflexxStore(initialState, config);
  if (config?.name) storeRegistry.set(config.name, store);
  return store;
}

export function getStore<T extends object>(
  name: string,
): ReflexxStore<T> | undefined {
  return storeRegistry.get(name);
}
