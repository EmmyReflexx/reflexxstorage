// hook.ts - React hooks optimized for scale and safe async hydration

import {
  useSyncExternalStore,
  useCallback,
  useRef,
  useState,
  useEffect,
} from 'react';
import { ReflexxStore } from '../ReflexxStore';
import { StateSelector, EqualityFn, SetStateAction } from '../types';

export function useReflexx<T extends object, R = T>(
  store: ReflexxStore<T>,
  selector?: StateSelector<T, R>,
  equalityFn?: EqualityFn<R>,
): [R, (updater: SetStateAction<T>, action?: string) => void, boolean] {
  const selectorFn = selector || ((state: T) => state as unknown as R);
  const eqFn = equalityFn || ((a: R, b: R) => Object.is(a, b));

  const lastSelectedState = useRef<R | null>(null);
  const lastStoreState = useRef<T | null>(null);

  // Track hydration updates seamlessly in the React lifecycle
  const [hydrated, setHydrated] = useState(() => store.hasHydrated());

  useEffect(() => {
    if (!hydrated) {
      store.hydrationPromise.then(() => setHydrated(true));
    }
  }, [store, hydrated]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      return store.subscribe(() => {
        const nextSelected = selectorFn(store.getState());
        if (!eqFn(lastSelectedState.current!, nextSelected)) {
          onStoreChange();
        }
      });
    },
    [store, selectorFn, eqFn],
  );

  const getSnapshot = useCallback(() => {
    const currentStoreState = store.getState();

    if (
      lastStoreState.current === currentStoreState &&
      lastSelectedState.current !== null
    ) {
      return lastSelectedState.current;
    }

    const currentSelected = selectorFn(currentStoreState);

    if (
      lastSelectedState.current !== null &&
      eqFn(lastSelectedState.current, currentSelected)
    ) {
      lastStoreState.current = currentStoreState;
      return lastSelectedState.current;
    }

    lastStoreState.current = currentStoreState;
    lastSelectedState.current = currentSelected;
    return currentSelected;
  }, [store, selectorFn, eqFn]);

  const selectedState = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );

  const setState = useCallback(
    (updater: SetStateAction<T>, action?: string) => {
      store.setState(updater, action);
    },
    [store],
  );

  // Return hydration state as the third parameter to protect against page flashes
  return [selectedState, setState, hydrated];
}

export function useReflexxValue<T extends object, K extends keyof T>(
  store: ReflexxStore<T>,
  key: K,
): [T[K], (value: T[K], action?: string) => void] {
  const [state, setState] = useReflexx(
    store,
    useCallback((s: T) => s[key], [key]),
    Object.is,
  );

  const updateValue = useCallback(
    (value: T[K], action?: string) => {
      setState((s: T) => ({ ...s, [key]: value }), action);
    },
    [setState, key],
  );

  return [state, updateValue];
}

export function useReflexxHistory<T extends object>(store: ReflexxStore<T>) {
  const [historyInfo, setHistoryInfo] = useState(() => store.getHistoryInfo());

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setHistoryInfo(store.getHistoryInfo());
    });
    return unsubscribe;
  }, [store]);

  return {
    undo: store.undo,
    redo: store.redo,
    clearHistory: store.clearHistory,
    canUndo: historyInfo.canUndo,
    canRedo: historyInfo.canRedo,
    historyInfo,
  };
}

export function useReflexxBatch<T extends object>(store: ReflexxStore<T>) {
  const batchUpdates = useCallback(
    (
      updates: Array<{ updater: SetStateAction<T>; action?: string }>,
      batchName?: string,
    ) => {
      store.batch(() => {
        updates.forEach(({ updater, action }) => {
          store.setState(updater, action);
        });
      }, batchName);
    },
    [store],
  );

  return { batchUpdates };
}

export {
  useIndexedDB,
  useIndexedDBItem,
  useIndexedDBAllItems,
  useIndexedDBSync,
  useIndexedDBStorage,
} from './indexedDBHooks';
