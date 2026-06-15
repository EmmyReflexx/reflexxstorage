// index.ts - Main exports

// Core exports
export { ReflexxStore, createStore, getStore } from './ReflexxStore';

// IndexedDB helper export
export { IndexedDBHelper } from './indexedDB';

// Hooks exports
export {
  useReflexx,
  useReflexxValue,
  useReflexxHistory,
  useReflexxBatch,
  useIndexedDB,
  useIndexedDBItem,
  useIndexedDBAllItems,
  useIndexedDBSync,
  useIndexedDBStorage,
} from './hooks/hook';

// Type exports
export type {
  Listener,
  StateSelector,
  EqualityFn,
  SetStateAction,
  Version,
  HistoryConfig,
  PersistConfig,
  StoreConfig,
  HistoryInfo,
  StorageType,
} from './types';
