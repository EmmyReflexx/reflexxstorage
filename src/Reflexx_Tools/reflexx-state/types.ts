// types.ts - All type definitions

export type Listener<T> = (state: T, prevState: T) => void;
export type StateSelector<T, R> = (state: T) => R;
export type EqualityFn<T = any> = (a: T, b: T) => boolean;
export type SetStateAction<T> = Partial<T> | ((state: T) => Partial<T>);

export interface Version<T> {
  id: string;
  state: T;
  timestamp: number;
  action?: string;
  changes: Partial<T>;
}

export interface HistoryConfig {
  maxVersions?: number; // Max number of versions to keep (default: 50)
  debounceTime?: number; // Debounce rapid changes in milliseconds (default: 0)
  ignoreIdentical?: boolean; // Don't save identical states (default: true)
  autoClearMs?: number; // Auto-clear old versions after X milliseconds (default: 0 = off)
}

export type StorageType = 'localStorage' | 'indexedDB';

export interface PersistConfig {
  key: string; // Storage key
  storage?: StorageType; // Storage type: 'localStorage' or 'indexedDB' (default: 'localStorage')
  whitelist?: string[]; // Only persist these fields
  blacklist?: string[]; // Don't persist these fields
  dbName?: string; // IndexedDB database name (default: 'ReflexxStore')
  storeName?: string; // IndexedDB store name (default: 'states')
  version?: number; // IndexedDB version (default: 1)
}

export interface StoreConfig<T> {
  name?: string; // Store name for debugging
  persist?: PersistConfig; // Persistence config
  devtools?: boolean; // Enable console logging
  history?: HistoryConfig; // Undo/redo config
}

export interface HistoryInfo<T> {
  canUndo: boolean;
  canRedo: boolean;
  pastCount: number;
  futureCount: number;
  totalVersions: number;
  currentAction?: string;
}
