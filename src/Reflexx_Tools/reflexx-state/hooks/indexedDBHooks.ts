// hooks/indexedDBHooks.ts - Easy hooks for IndexedDB operations

import { useCallback, useEffect, useState } from 'react';
import { ReflexxStore } from '../ReflexxStore';
import { IndexedDBHelper } from '../indexedDB';

// Hook to get IndexedDB helper instance
export function useIndexedDB(
  dbName: string = 'ReflexxStore',
  storeName: string = 'states',
  version: number = 1,
) {
  const [helper] = useState(
    () => new IndexedDBHelper(dbName, storeName, version),
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize the database connection
    const init = async () => {
      await helper.getItem('__init__'); // Trigger initialization
      setIsReady(true);
    };
    init();
  }, [helper]);

  return { helper, isReady };
}

// Hook to easily get/set items in IndexedDB (like useState but for IndexedDB)
export function useIndexedDBItem<T>(
  key: string,
  defaultValue?: T,
  config?: {
    dbName?: string;
    storeName?: string;
    version?: number;
  },
) {
  const { helper, isReady } = useIndexedDB(
    config?.dbName || 'ReflexxStore',
    config?.storeName || 'states',
    config?.version || 1,
  );

  const [value, setValue] = useState<T>(defaultValue as T);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load item on mount
  useEffect(() => {
    if (isReady) {
      loadItem();
    }
  }, [key, isReady]);

  const loadItem = async () => {
    try {
      setLoading(true);
      const data = await helper.getItem<T>(key);
      setValue(data !== null ? data : (defaultValue as T));
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error(`Failed to load ${key} from IndexedDB:`, err);
    } finally {
      setLoading(false);
    }
  };

  const updateValue = useCallback(
    async (newValue: T) => {
      try {
        setLoading(true);
        await helper.setItem(key, newValue);
        setValue(newValue);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error(`Failed to save ${key} to IndexedDB:`, err);
      } finally {
        setLoading(false);
      }
    },
    [key, helper],
  );

  const removeItem = useCallback(async () => {
    try {
      setLoading(true);
      await helper.removeItem(key);
      setValue(defaultValue as T);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error(`Failed to remove ${key} from IndexedDB:`, err);
    } finally {
      setLoading(false);
    }
  }, [key, helper, defaultValue]);

  return { value, updateValue, removeItem, loading, error, reload: loadItem };
}

// Hook to get all items from a store
export function useIndexedDBAllItems(storeName?: string, dbName?: string) {
  const { helper, isReady } = useIndexedDB(
    dbName || 'ReflexxStore',
    storeName || 'states',
  );

  const [items, setItems] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    if (isReady) {
      loadAllItems();
    }
  }, [isReady, storeName]);

  const loadAllItems = async () => {
    try {
      setLoading(true);
      const allItems = await helper.getAllItems();
      const allKeys = await helper.getAllKeys();
      setItems(allItems);
      setKeys(allKeys);
    } catch (err) {
      console.error('Failed to load all items from IndexedDB:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearAllItems = useCallback(async () => {
    try {
      await helper.clear();
      await loadAllItems();
    } catch (err) {
      console.error('Failed to clear IndexedDB store:', err);
    }
  }, [helper]);

  return {
    items,
    keys,
    loading,
    reload: loadAllItems,
    clearAll: clearAllItems,
  };
}

// Hook to sync ReflexxStore with IndexedDB (automatic)
export function useIndexedDBSync<T extends object>(
  store: ReflexxStore<T>,
  config: {
    key: string;
    dbName?: string;
    storeName?: string;
    version?: number;
    syncDirection?: 'both' | 'store-to-db' | 'db-to-store';
  },
) {
  const { helper, isReady } = useIndexedDB(
    config.dbName || 'ReflexxStore',
    config.storeName || 'states',
    config.version || 1,
  );

  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Save store state to IndexedDB
  const saveToIndexedDB = useCallback(async () => {
    if (!isReady) return;
    try {
      setSyncing(true);
      const state = store.getState();
      await helper.setItem(config.key, state);
      setLastSync(new Date());
      if (store['devtools']) {
        console.log(`💾 [${store['name']}] Synced to IndexedDB:`, state);
      }
    } catch (err) {
      console.error('Failed to sync to IndexedDB:', err);
    } finally {
      setSyncing(false);
    }
  }, [store, helper, config.key, isReady]);

  // Load from IndexedDB to store
  const loadFromIndexedDB = useCallback(async () => {
    if (!isReady) return;
    try {
      setSyncing(true);
      const data = await helper.getItem<T>(config.key);
      if (data) {
        await store.setState(data, 'LOAD_FROM_INDEXEDDB');
        setLastSync(new Date());
        if (store['devtools']) {
          console.log(`📥 [${store['name']}] Loaded from IndexedDB:`, data);
        }
      }
    } catch (err) {
      console.error('Failed to load from IndexedDB:', err);
    } finally {
      setSyncing(false);
    }
  }, [store, helper, config.key, isReady]);

  // Auto-sync based on direction
  useEffect(() => {
    if (!isReady) return;

    if (
      config.syncDirection === 'db-to-store' ||
      config.syncDirection === 'both'
    ) {
      loadFromIndexedDB();
    }

    let unsubscribe: (() => void) | undefined;

    if (
      config.syncDirection === 'store-to-db' ||
      config.syncDirection === 'both'
    ) {
      unsubscribe = store.subscribe(() => {
        saveToIndexedDB();
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [store, isReady, config.syncDirection]);

  return {
    saveToIndexedDB,
    loadFromIndexedDB,
    syncing,
    lastSync,
    isReady,
  };
}

// Simple hook for quick IndexedDB operations (like localStorage)
export function useIndexedDBStorage() {
  const [helper] = useState(() => new IndexedDBHelper());

  return {
    setItem: useCallback(
      async <T>(key: string, value: T) => {
        await helper.setItem(key, value);
      },
      [helper],
    ),

    getItem: useCallback(
      async <T>(key: string): Promise<T | null> => {
        return await helper.getItem<T>(key);
      },
      [helper],
    ),

    removeItem: useCallback(
      async (key: string) => {
        await helper.removeItem(key);
      },
      [helper],
    ),

    clear: useCallback(async () => {
      await helper.clear();
    }, [helper]),

    getAllKeys: useCallback(async () => {
      return await helper.getAllKeys();
    }, [helper]),
  };
}
