# Reflexx - High-Performance State Management Library

## Table of Contents

1. [Introduction](#introduction)
2. [Core Concepts](#core-concepts)
3. [Installation & Setup](#installation--setup)
4. [Creating Stores](#creating-stores)
5. [React Hooks API](#react-hooks-api)
6. [Persistence](#persistence)
7. [History & Undo/Redo](#history--undo-redo)
8. [IndexedDB Integration](#indexeddb-integration)
9. [TypeScript Support](#typescript-support)
10. [Best Practices](#best-practices)
11. [API Reference](#api-reference)

---

## Introduction

**Reflexx** is a high-performance state management library for React applications, designed with scale, type safety, and developer experience in mind. It combines the simplicity of Zustand-like stores with powerful features like built-in undo/redo, persistence (localStorage & IndexedDB), and optimized React hooks.

### Key Features

- 🔒 **Immutable by default** - Prevents direct mutations (in development)
- ⏪ **Built-in undo/redo** with full history tracking
- 💾 **Flexible persistence** (localStorage & IndexedDB)
- ⚡ **High performance** with structural sharing and debouncing
- 🔄 **Async hydration** with safe React integration
- 📦 **Batch updates** for multiple state changes
- 🎯 **Selective subscriptions** with equality checks
- 🗃️ **IndexedDB hooks** for large datasets

---

## Core Concepts

### Immutability Safety

In development mode, Reflexx wraps your state in a Proxy that throws errors if you try to mutate it directly:

```typescript
// ❌ This will throw an error in development
store.getState().user.name = 'John';

// ✅ Always use setState
store.setState({ user: { ...store.getState().user, name: 'John' } });
```

### State Versions

Every state change creates a `Version` object:

```typescript
interface Version<T> {
  id: string; // Unique identifier
  state: T; // Full state snapshot
  timestamp: number; // When the change occurred
  action?: string; // Optional action name for debugging
  changes: Partial<T>; // What actually changed
}
```

---

## Installation & Setup

```bash
npm install reflexx
# or
yarn add reflexx
```

### Basic Setup

```typescript
import { createStore, useReflexx } from 'reflexx';

// Define your state type
interface AppState {
  user: { name: string; age: number };
  theme: 'light' | 'dark';
  notifications: string[];
}

// Create a store
const store = createStore<AppState>(
  {
    user: { name: 'Alice', age: 30 },
    theme: 'light',
    notifications: [],
  },
  {
    name: 'appStore',
    devtools: true, // Enable console logging
  },
);
```

---

## Creating Stores

### `createStore<T>(initialState, config)`

Creates a new store instance.

```typescript
import { createStore } from 'reflexx';

interface CounterState {
  count: number;
  lastUpdated: number;
}

const counterStore = createStore<CounterState>(
  { count: 0, lastUpdated: Date.now() },
  {
    name: 'counter', // For debugging and registry lookup
    devtools: true, // Logs all state changes
    history: {
      // Undo/redo configuration
      maxVersions: 100,
      debounceTime: 300,
      ignoreIdentical: true,
    },
    persist: {
      // Persistence configuration
      key: 'counter-storage',
      storage: 'localStorage',
      whitelist: ['count'], // Only persist the 'count' field
    },
  },
);
```

### `getStore(name)`

Retrieves a registered store by name.

```typescript
import { getStore } from 'reflexx';

const store = getStore<CounterState>('counter');
if (store) {
  store.setState({ count: 10 });
}
```

---

## React Hooks API

### `useReflexx(store, selector?, equalityFn?)`

The primary hook for subscribing to store state.

```typescript
import { useReflexx } from 'reflexx';

function UserProfile() {
  // Subscribe to the entire state
  const [state, setState, hydrated] = useReflexx(userStore);

  // Subscribe to a specific slice with selector
  const [userName, setState] = useReflexx(
    userStore,
    (state) => state.user.name
  );

  // With custom equality check (prevents unnecessary re-renders)
  const [user, setState] = useReflexx(
    userStore,
    (state) => state.user,
    (a, b) => a.id === b.id  // Only re-render if ID changes
  );

  return <div>{userName}</div>;
}
```

**Return value:** `[selectedState, setState, hydrated]`

- `selectedState`: The selected portion of state
- `setState`: Function to update state
- `hydrated`: Boolean indicating if persisted state has been loaded

### `useReflexxValue(store, key)`

Shorthand for subscribing to a single property.

```typescript
import { useReflexxValue } from 'reflexx';

function ThemeToggle() {
  const [theme, setTheme] = useReflexxValue(themeStore, 'theme');

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current theme: {theme}
    </button>
  );
}
```

### `useReflexxHistory(store)`

Provides undo/redo functionality.

```typescript
import { useReflexxHistory } from 'reflexx';

function UndoRedoControls() {
  const { undo, redo, canUndo, canRedo, historyInfo } = useReflexxHistory(store);

  return (
    <div>
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <button onClick={redo} disabled={!canRedo}>Redo</button>
      <small>
        Past: {historyInfo.pastCount} | Future: {historyInfo.futureCount}
      </small>
    </div>
  );
}
```

**Return value:**

```typescript
{
  undo: () => Promise<boolean>;
  redo: () => Promise<boolean>;
  clearHistory: (keepCurrent?: boolean) => void;
  canUndo: boolean;
  canRedo: boolean;
  historyInfo: HistoryInfo<T>;
}
```

### `useReflexxBatch(store)`

Batch multiple updates into a single state change and history entry.

```typescript
import { useReflexxBatch } from 'reflexx';

function BulkEditor() {
  const { batchUpdates } = useReflexxBatch(userStore);

  const updateMultiple = () => {
    batchUpdates([
      { updater: { name: "Bob" }, action: "update_name" },
      { updater: { age: 31 }, action: "update_age" },
      { updater: (state) => ({ version: state.version + 1 }) }
    ], "BULK_UPDATE");
  };

  return <button onClick={updateMultiple}>Update All</button>;
}
```

---

## Persistence

Reflexx supports two storage backends: `localStorage` and `IndexedDB`.

### PersistConfig Interface

```typescript
interface PersistConfig {
  key: string; // Storage key (required)
  storage?: 'localStorage' | 'indexedDB'; // Default: 'localStorage'
  whitelist?: string[]; // Only persist these fields
  blacklist?: string[]; // Don't persist these fields
  dbName?: string; // IndexedDB database name (default: 'ReflexxStore')
  storeName?: string; // IndexedDB store name (default: 'states')
  version?: number; // IndexedDB version (default: 1)
}
```

### Example: localStorage Persistence

```typescript
const store = createStore<SettingsState>(
  { volume: 50, brightness: 80, theme: 'dark' },
  {
    persist: {
      key: 'user-settings',
      storage: 'localStorage',
      whitelist: ['volume', 'brightness'], // theme won't be persisted
    },
  },
);
```

### Example: IndexedDB Persistence (for large data)

```typescript
const store = createStore<LargeDataState>(
  { users: [], products: [], transactions: [] },
  {
    persist: {
      key: 'app-data',
      storage: 'indexedDB',
      dbName: 'MyAppDB',
      storeName: 'appState',
    },
  },
);
```

### Hydration Handling

Reflexx automatically hydrates persisted state. Use the `hydrated` flag to prevent UI flashes:

```typescript
function App() {
  const [state, setState, hydrated] = useReflexx(store);

  if (!hydrated) {
    return <LoadingSpinner />;  // Show loader until persisted state loads
  }

  return <div>{/* Your app content */}</div>;
}
```

---

## History & Undo/Redo

### HistoryConfig Options

```typescript
interface HistoryConfig {
  maxVersions?: number; // Max history entries (default: 50)
  debounceTime?: number; // Debounce rapid changes in ms (default: 0)
  ignoreIdentical?: boolean; // Skip identical states (default: true)
  autoClearMs?: number; // Auto-delete old versions (default: 0 = off)
}
```

### Complete History Example

```typescript
interface EditorState {
  content: string;
  cursorPosition: number;
  selections: string[];
}

const editorStore = createStore<EditorState>(
  { content: "", cursorPosition: 0, selections: [] },
  {
    name: "editor",
    devtools: true,
    history: {
      maxVersions: 100,           // Keep 100 versions
      debounceTime: 500,          // Group rapid typing into single history entry
      ignoreIdentical: true,      // Don't store if nothing changed
      autoClearMs: 3600000        // Clear versions older than 1 hour
    }
  }
);

// Usage in component
function Editor() {
  const [content, setContent] = useReflexxValue(editorStore, 'content');
  const { undo, redo, canUndo, canRedo } = useReflexxHistory(editorStore);

  // Actions with custom names for history
  const handleSave = () => {
    setContent(content, "USER_SAVE");
  };

  return (
    <div>
      <textarea value={content} onChange={(e) => setContent(e.target.value, "TYPING")} />
      <button onClick={undo} disabled={!canUndo}>Undo (Ctrl+Z)</button>
      <button onClick={redo} disabled={!canRedo}>Redo (Ctrl+Y)</button>
    </div>
  );
}
```

### Programmatic History Methods

```typescript
const store = createStore({ text: '' }, { history: { maxVersions: 50 } });

// Jump to specific version by ID
await store.jumpToVersion('1703123456789-abc123');

// Get history information
const info = store.getHistoryInfo();
console.log(info.canUndo, info.pastCount);

// Clear all history but keep current state
store.clearHistory(true);

// Reset state and clear history
await store.reset({ text: 'New start' });
```

---

## IndexedDB Integration

Reflexx provides dedicated hooks for working with IndexedDB directly, independent of the store's persistence.

### `useIndexedDBItem<T>(key, defaultValue, config)`

Like `useState` but backed by IndexedDB.

```typescript
import { useIndexedDBItem } from 'reflexx';

function UserPreferences() {
  const {
    value: theme,
    updateValue: setTheme,
    loading,
    error,
    removeItem
  } = useIndexedDBItem<string>('theme', 'light', {
    dbName: 'UserDB',
    storeName: 'preferences'
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option>light</option>
        <option>dark</option>
      </select>
      <button onClick={removeItem}>Reset to Default</button>
    </div>
  );
}
```

### `useIndexedDBAllItems()`

Get all items from a store.

```typescript
import { useIndexedDBAllItems } from 'reflexx';

function AllDataViewer() {
  const { items, keys, loading, clearAll } = useIndexedDBAllItems('myStore');

  return (
    <div>
      {Array.from(keys).map(key => (
        <div key={key}>{key}: {JSON.stringify(items.get(key))}</div>
      ))}
      <button onClick={clearAll}>Clear All</button>
    </div>
  );
}
```

### `useIndexedDBSync(store, config)`

Two-way sync between a Reflexx store and IndexedDB.

```typescript
import { useIndexedDBSync } from 'reflexx';

function SyncedComponent() {
  const store = useMemo(() => createStore({ data: [] }), []);

  const { syncing, lastSync, saveToIndexedDB, loadFromIndexedDB } = useIndexedDBSync(store, {
    key: 'my-data',
    syncDirection: 'both',  // 'both' | 'store-to-db' | 'db-to-store'
    dbName: 'MyAppDB'
  });

  return (
    <div>
      {syncing && <span>Syncing...</span>}
      {lastSync && <span>Last sync: {lastSync.toLocaleTimeString()}</span>}
      <button onClick={saveToIndexedDB}>Manual Save</button>
      <button onClick={loadFromIndexedDB}>Manual Load</button>
    </div>
  );
}
```

### `useIndexedDBStorage()`

Simple, localStorage-like API for IndexedDB.

```typescript
import { useIndexedDBStorage } from 'reflexx';

function SimpleStorage() {
  const { setItem, getItem, removeItem, clear } = useIndexedDBStorage();

  const saveData = async () => {
    await setItem('user', { name: 'Bob', age: 25 });
    const data = await getItem('user');
    console.log(data);
  };

  return <button onClick={saveData}>Save</button>;
}
```

### Standalone IndexedDBHelper

```typescript
import { IndexedDBHelper } from 'reflexx';

const db = new IndexedDBHelper('MyDB', 'items', 1);

// CRUD operations
await db.setItem('key1', { value: 123 });
const data = await db.getItem('key1');
await db.removeItem('key1');
await db.clear();
const allKeys = await db.getAllKeys();
const allItems = await db.getAllItems(); // Returns Map<string, any>
```

---

## TypeScript Support

Reflexx is written in TypeScript and provides full type inference.

### Defining State Types

```typescript
interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
  searchQuery: string;
}

const todoStore = createStore<TodoState>({
  todos: [],
  filter: 'all',
  searchQuery: '',
});

// TypeScript will infer everything
const [todos, setTodos] = useReflexxValue(todoStore, 'todos');
// todos is Todo[], setTodos expects Todo[]
```

### Custom Equality Functions

```typescript
// Deep equality for complex objects
import { deepEqual } from 'fast-equals';

const [user, setUser] = useReflexx(
  userStore,
  (state) => state.user,
  (a, b) => deepEqual(a, b), // Only re-render when deeply different
);

// Shallow array comparison
const [items, setItems] = useReflexx(
  itemStore,
  (state) => state.items,
  (a, b) => a.length === b.length && a.every((item, i) => item.id === b[i]?.id),
);
```

---

## Best Practices

### 1. Use Selectors for Performance

```typescript
// ❌ Re-renders on ANY state change
const [state, setState] = useReflexx(store);

// ✅ Only re-renders when user.name changes
const [userName, setState] = useReflexx(store, (state) => state.user.name);
```

### 2. Batch Related Updates

```typescript
// ❌ Three separate updates = three renders + three history entries
setState({ count: count + 1 });
setState({ lastUpdated: Date.now() });
setState({ version: version + 1 });

// ✅ Single update = one render + one history entry
const { batchUpdates } = useReflexxBatch(store);
batchUpdates(
  [
    { updater: { count: count + 1 } },
    { updater: { lastUpdated: Date.now() } },
    { updater: (s) => ({ version: s.version + 1 }) },
  ],
  'INCREMENT_ALL',
);
```

### 3. Handle Hydration Gracefully

```typescript
function App() {
  const [state, setState, hydrated] = useReflexx(store);

  if (!hydrated) {
    return <SkeletonLoader />;
  }

  return <RealContent />;
}
```

### 4. Use Action Names for Debugging

```typescript
// Named actions appear in history and devtools
setState({ user: newUser }, 'USER_UPDATED');
setState((state) => ({ count: state.count + 1 }), 'INCREMENT');

// Makes debugging much easier!
```

### 5. Configure History for Different Use Cases

```typescript
// Form editor: Debounce rapid typing
const formStore = createStore(formState, {
  history: { debounceTime: 500, maxVersions: 50 },
});

// Game state: No debounce, many versions
const gameStore = createStore(gameState, {
  history: { debounceTime: 0, maxVersions: 1000 },
});

// Analytics: Auto-clear old data
const analyticsStore = createStore(analyticsState, {
  history: { autoClearMs: 86400000 }, // Clear after 24 hours
});
```

### 6. Use IndexedDB for Large Datasets

```typescript
// localStorage has ~5-10MB limit
// IndexedDB can handle hundreds of MB

const store = createStore<LargeDataState>(
  { items: [] },
  {
    persist: {
      storage: 'indexedDB', // Better for large data
      key: 'large-dataset',
      dbName: 'MyApp',
    },
  },
);
```

---

## API Reference

### Store Methods

| Method                       | Description                                               |
| ---------------------------- | --------------------------------------------------------- |
| `getState()`                 | Returns the current state (read-only)                     |
| `setState(updater, action?)` | Updates state, optionally with action name                |
| `subscribe(listener)`        | Subscribes to state changes, returns unsubscribe function |
| `batch(cb, batchName?)`      | Batches multiple updates                                  |
| `undo()`                     | Undo last action, returns success boolean                 |
| `redo()`                     | Redo last undone action, returns success boolean          |
| `clearHistory(keepCurrent?)` | Clears history                                            |
| `getHistoryInfo()`           | Returns history metadata                                  |
| `jumpToVersion(versionId)`   | Navigates to specific history version                     |
| `reset(newState?)`           | Resets state to initial or provided state                 |
| `hasHydrated()`              | Returns hydration status                                  |
| `destroy()`                  | Cleans up store resources                                 |

### Hook Return Values

| Hook                   | Returns                                                              |
| ---------------------- | -------------------------------------------------------------------- |
| `useReflexx`           | `[state, setState, hydrated]`                                        |
| `useReflexxValue`      | `[value, setValue]`                                                  |
| `useReflexxHistory`    | `{ undo, redo, clearHistory, canUndo, canRedo, historyInfo }`        |
| `useReflexxBatch`      | `{ batchUpdates }`                                                   |
| `useIndexedDBItem`     | `{ value, updateValue, removeItem, loading, error, reload }`         |
| `useIndexedDBAllItems` | `{ items, keys, loading, reload, clearAll }`                         |
| `useIndexedDBSync`     | `{ saveToIndexedDB, loadFromIndexedDB, syncing, lastSync, isReady }` |
| `useIndexedDBStorage`  | `{ setItem, getItem, removeItem, clear, getAllKeys }`                |

---

## License

MIT

---

## Support & Contributing

- **Issues**: [GitHub Issues](https://github.com/yourusername/reflexx/issues)
- **Documentation**: [reflexx.dev](https://reflexx.dev)
- **Discord**: [Join our community](https://discord.gg/reflexx)

# Complete Reflexx Demo Application

I'll create a comprehensive demo application showcasing all Reflexx features with detailed explanations.

```typescript
// demo/types.ts - Application State Types
export interface CounterState {
  count: number;
  theme: 'light' | 'dark';
  lastAction: string;
  lastUpdated: number;
  version: number;
}

export interface UserPreferences {
  soundEnabled: boolean;
  autoSave: boolean;
  historySize: number;
}
```

```tsx
// demo/CounterApp.tsx - Main Application Component
import React, { useEffect, useCallback } from 'react';
import {
  createStore,
  useReflexx,
  useReflexxValue,
  useReflexxHistory,
  useReflexxBatch,
  useIndexedDBItem,
  useIndexedDBStorage,
  getStore,
} from 'reflexx';

// ============================================
// 1. CREATE STORES WITH DIFFERENT CONFIGURATIONS
// ============================================

/**
 * WHY: We create multiple stores to demonstrate different persistence strategies
 * and configuration options. Each store serves a different purpose.
 */
const counterStore = createStore<CounterState>(
  {
    count: 0,
    theme: 'light',
    lastAction: 'initialized',
    lastUpdated: Date.now(),
    version: 1,
  },
  {
    name: 'counter', // For debugging and registry access
    devtools: true, // Logs all state changes to console
    history: {
      // Enable undo/redo with custom config
      maxVersions: 50, // Keep last 50 states
      debounceTime: 300, // Group rapid updates (like button mashing)
      ignoreIdentical: true, // Don't store if count didn't change
      autoClearMs: 0, // Never auto-clear (keep history forever)
    },
    persist: {
      // Persist to localStorage
      key: 'counter-storage',
      storage: 'localStorage', // Using localStorage for small data
      whitelist: ['theme', 'count'], // Only persist these fields
    },
  },
);

// Store for large data using IndexedDB
const analyticsStore = createStore<{ events: any[] }>(
  { events: [] },
  {
    name: 'analytics',
    devtools: false, // Don't log analytics (too noisy)
    persist: {
      key: 'analytics-data',
      storage: 'indexedDB', // Using IndexedDB for potentially large data
      dbName: 'CounterAnalytics',
      storeName: 'events',
    },
  },
);

// ============================================
// 2. CUSTOM HOOK FOR KEYBOARD SHORTCUTS
// ============================================

const useKeyboardShortcuts = () => {
  const { undo, redo } = useReflexxHistory(counterStore);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl+Y or Ctrl+Shift+Z for redo
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'y' || (e.key === 'z' && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);
};

// ============================================
// 3. REACT COMPONENTS
// ============================================

/**
 * Counter Display Component
 * Demonstrates useReflexx with selector for performance
 */
const CounterDisplay: React.FC = () => {
  /**
   * WHY useReflexx with selector:
   * - Selector extracts only 'count' from state
   * - Component only re-renders when 'count' changes
   * - If 'theme' or 'lastAction' changes, this component won't re-render
   * - This is CRITICAL for performance in large apps
   */
  const [count, setCount] = useReflexx(
    counterStore,
    (state) => state.count, // Select only what we need
    (a, b) => a === b, // Simple equality check (numbers)
  );

  /**
   * Alternative approach: useReflexxValue for single property
   * More concise but less flexible than selector
   */
  const [theme] = useReflexxValue(counterStore, 'theme');

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '20px',
        backgroundColor: theme === 'dark' ? '#333' : '#f0f0f0',
        color: theme === 'dark' ? '#fff' : '#000',
        borderRadius: '10px',
      }}
    >
      <h2>Current Count</h2>
      <div style={{ fontSize: '72px', fontWeight: 'bold' }}>{count}</div>
      <small style={{ opacity: 0.7 }}>
        Theme: {theme} | Component only re-renders on count change
      </small>
    </div>
  );
};

/**
 * Theme Toggle Component
 * Demonstrates useReflexxValue for simple property access
 */
const ThemeToggle: React.FC = () => {
  /**
   * WHY useReflexxValue:
   * - Perfect for simple property reads/writes
   * - Less boilerplate than useReflexx with selector
   * - Automatically handles the update with proper immutability
   */
  const [theme, setTheme] = useReflexxValue(counterStore, 'theme');

  const toggleTheme = (actionName: string) => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    /**
     * WHY pass action name:
     * - Appears in devtools console
     * - Stored in history for debugging
     * - Helps track user actions
     */
    setTheme(newTheme, actionName);
  };

  return (
    <button
      onClick={() => toggleTheme('THEME_TOGGLE')}
      style={{
        padding: '10px 20px',
        margin: '10px',
        cursor: 'pointer',
        backgroundColor: theme === 'light' ? '#333' : '#fff',
        color: theme === 'light' ? '#fff' : '#333',
        border: 'none',
        borderRadius: '5px',
      }}
    >
      Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
    </button>
  );
};

/**
 * Counter Controls with Batch Updates
 * Demonstrates useReflexxBatch for performance optimization
 */
const CounterControls: React.FC = () => {
  const [count, setCount] = useReflexxValue(counterStore, 'count');
  const { batchUpdates } = useReflexxBatch(counterStore);

  /**
   * Simple increment - single update
   */
  const increment = () => {
    setCount(count + 1, 'INCREMENT');
  };

  /**
   * WHY BATCH UPDATES:
   * - Without batching: 3 separate history entries, 3 re-renders
   * - With batching: 1 history entry, 1 re-render
   * - Critical for operations that logically should be atomic
   */
  const incrementByFive = () => {
    // Without batching - BAD:
    // setCount(count + 1, 'STEP_1');
    // setCount(count + 2, 'STEP_2');
    // setCount(count + 3, 'STEP_3');

    // With batching - GOOD:
    batchUpdates(
      [
        { updater: { count: count + 1 }, action: 'ADD_1' },
        { updater: { count: count + 2 }, action: 'ADD_2' },
        { updater: { count: count + 3 }, action: 'ADD_3' },
      ],
      'BATCH_INCREMENT_5',
    ); // Single history entry for all three updates
  };

  const decrement = () => {
    setCount(count - 1, 'DECREMENT');
  };

  const reset = async () => {
    /**
     * WHY reset method:
     * - Clears history by default
     * - Can optionally keep current state in history
     */
    await counterStore.reset({
      count: 0,
      theme: 'light',
      lastAction: 'reset',
      lastUpdated: Date.now(),
      version: 1,
    });
  };

  return (
    <div style={{ textAlign: 'center', margin: '20px' }}>
      <button onClick={increment} style={buttonStyle}>
        +1 (Single)
      </button>
      <button
        onClick={incrementByFive}
        style={{ ...buttonStyle, backgroundColor: '#4CAF50' }}
      >
        +5 (Batch)
      </button>
      <button onClick={decrement} style={buttonStyle}>
        -1
      </button>
      <button
        onClick={reset}
        style={{ ...buttonStyle, backgroundColor: '#f44336' }}
      >
        Reset
      </button>
    </div>
  );
};

/**
 * Undo/Redo Controls with History Info
 * Demonstrates useReflexxHistory
 */
const HistoryControls: React.FC = () => {
  /**
   * WHY useReflexxHistory:
   * - Provides all undo/redo functionality
   * - Automatically subscribes to history changes
   * - Returns real-time history info
   */
  const { undo, redo, canUndo, canRedo, historyInfo, clearHistory } =
    useReflexxHistory(counterStore);

  return (
    <div
      style={{
        textAlign: 'center',
        margin: '20px',
        padding: '15px',
        border: '1px solid #ccc',
        borderRadius: '8px',
      }}
    >
      <h3>History Controls</h3>
      <div>
        <button
          onClick={undo}
          disabled={!canUndo}
          style={{ ...buttonStyle, backgroundColor: '#2196F3' }}
        >
          ↩️ Undo (Ctrl+Z)
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          style={{ ...buttonStyle, backgroundColor: '#2196F3' }}
        >
          ↪️ Redo (Ctrl+Y)
        </button>
        <button
          onClick={() => clearHistory(true)}
          style={{ ...buttonStyle, backgroundColor: '#FF9800' }}
        >
          🗑️ Clear History
        </button>
      </div>
      <div style={{ fontSize: '12px', marginTop: '10px' }}>
        <div>
          📜 Past: {historyInfo.pastCount} | Future: {historyInfo.futureCount}
        </div>
        <div>📊 Total Versions: {historyInfo.totalVersions}</div>
        <div>⚡ Current Action: {historyInfo.currentAction || 'none'}</div>
        <div>
          🔍 Can Undo: {canUndo ? 'Yes' : 'No'} | Can Redo:{' '}
          {canRedo ? 'Yes' : 'No'}
        </div>
      </div>
    </div>
  );
};

/**
 * Debug Information Component
 * Shows full state and persistence status
 */
const DebugInfo: React.FC = () => {
  /**
   * WHY useReflexx without selector:
   * - Debug component needs FULL state
   * - Performance not critical for debug tools
   * - Shows everything in one place
   */
  const [state, setState, hydrated] = useReflexx(counterStore);
  const [analytics] = useReflexx(analyticsStore);

  /**
   * Manual save/load using store methods
   */
  const manualSave = async () => {
    // Access store directly for operations not exposed via hooks
    const currentState = counterStore.getState();
    console.log('Manual save:', currentState);
    alert(
      'State saved to ' +
        (counterStore['persistConfig']?.storage || 'localStorage'),
    );
  };

  const manualLoad = async () => {
    // Force reload from storage
    await counterStore['loadFromStorage']();
    alert('State reloaded from storage');
  };

  return (
    <div
      style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
      }}
    >
      <h4>🔧 Debug Information</h4>
      <div>💧 Hydrated: {hydrated ? 'Yes' : 'No (loading...)'}</div>
      <div>📦 Current State:</div>
      <pre style={{ overflow: 'auto', maxHeight: '200px' }}>
        {JSON.stringify(state, null, 2)}
      </pre>
      <div>📊 Analytics Events: {analytics.events.length}</div>
      <div>
        <button onClick={manualSave} style={smallButtonStyle}>
          Manual Save
        </button>
        <button onClick={manualLoad} style={smallButtonStyle}>
          Manual Load
        </button>
      </div>
    </div>
  );
};

/**
 * IndexedDB Demo Component
 * Shows direct IndexedDB operations independent of store persistence
 */
const IndexedDBDemo: React.FC = () => {
  /**
   * WHY useIndexedDBItem:
   * - Like useState but persists to IndexedDB
   * - Perfect for user preferences that need to survive page refresh
   * - Handles loading/error states automatically
   */
  const {
    value: preferences,
    updateValue: setPreferences,
    loading,
    error,
    removeItem,
  } = useIndexedDBItem<UserPreferences>(
    'user-preferences',
    {
      soundEnabled: true,
      autoSave: true,
      historySize: 25,
    },
    {
      dbName: 'CounterApp',
      storeName: 'userSettings',
    },
  );

  /**
   * WHY useIndexedDBStorage:
   * - Simple key-value API like localStorage
   * - But with IndexedDB's larger storage limits
   * - Async operations prevent UI blocking
   */
  const { setItem, getItem, getAllKeys } = useIndexedDBStorage();

  const saveSnapshot = async () => {
    const currentState = counterStore.getState();
    await setItem(`snapshot-${Date.now()}`, currentState);
    alert('Snapshot saved to IndexedDB!');
  };

  const loadSnapshots = async () => {
    const keys = await getAllKeys();
    const snapshotKeys = keys.filter((k) => k.startsWith('snapshot-'));
    alert(`Found ${snapshotKeys.length} snapshots in IndexedDB`);
  };

  if (loading) return <div>Loading preferences...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div
      style={{
        marginTop: '20px',
        padding: '15px',
        border: '2px solid #4CAF50',
        borderRadius: '8px',
      }}
    >
      <h3>🗄️ IndexedDB Features</h3>

      <div style={{ margin: '10px 0' }}>
        <h4>User Preferences (IndexedDB)</h4>
        <label>
          <input
            type="checkbox"
            checked={preferences.soundEnabled}
            onChange={(e) =>
              setPreferences({ ...preferences, soundEnabled: e.target.checked })
            }
          />
          Sound Enabled
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={preferences.autoSave}
            onChange={(e) =>
              setPreferences({ ...preferences, autoSave: e.target.checked })
            }
          />
          Auto Save
        </label>
        <br />
        <label>
          History Size:
          <input
            type="number"
            value={preferences.historySize}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                historySize: parseInt(e.target.value),
              })
            }
            style={{ marginLeft: '10px', width: '60px' }}
          />
        </label>
        <button onClick={() => removeItem()} style={smallButtonStyle}>
          Reset Preferences
        </button>
      </div>

      <div>
        <h4>State Snapshots (IndexedDB)</h4>
        <button onClick={saveSnapshot} style={smallButtonStyle}>
          💾 Save Current State as Snapshot
        </button>
        <button onClick={loadSnapshots} style={smallButtonStyle}>
          📋 List Snapshots
        </button>
      </div>
    </div>
  );
};

/**
 * Analytics Recorder
 * Demonstrates using IndexedDB for event logging
 */
const AnalyticsRecorder: React.FC = () => {
  const [state] = useReflexx(counterStore);

  // Record every state change to IndexedDB
  useEffect(() => {
    const unsubscribe = counterStore.subscribe((newState) => {
      const event = {
        timestamp: Date.now(),
        count: newState.count,
        theme: newState.theme,
        action: newState.lastAction,
      };

      // Store in IndexedDB (async, won't block UI)
      analyticsStore.setState(
        (current) => ({
          events: [...current.events, event],
        }),
        'RECORD_EVENT',
      );
    });

    return unsubscribe;
  }, []);

  return null; // This component doesn't render anything
};

// ============================================
// 4. STYLES
// ============================================

const buttonStyle: React.CSSProperties = {
  padding: '10px 20px',
  margin: '5px',
  fontSize: '16px',
  cursor: 'pointer',
  backgroundColor: '#008CBA',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  transition: 'all 0.3s',
};

const smallButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  padding: '5px 10px',
  fontSize: '12px',
  margin: '5px',
};

// ============================================
// 5. MAIN APP COMPONENT
// ============================================

const CounterApp: React.FC = () => {
  // Enable keyboard shortcuts (undo/redo)
  useKeyboardShortcuts();

  // Get store from registry by name (alternative to direct import)
  const registryStore = getStore<CounterState>('counter');

  useEffect(() => {
    console.log('Store from registry:', registryStore);

    // Subscribe to store for logging (outside React)
    const unsubscribe = counterStore.subscribe((state, prevState) => {
      console.log(`State changed from ${prevState.count} to ${state.count}`);
    });

    return () => unsubscribe();
  }, [registryStore]);

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1 style={{ textAlign: 'center' }}>🎯 Reflexx Counter Demo</h1>

      {/* Hidden component for analytics */}
      <AnalyticsRecorder />

      {/* Main components */}
      <CounterDisplay />
      <ThemeToggle />
      <CounterControls />
      <HistoryControls />

      {/* Advanced features */}
      <IndexedDBDemo />
      <DebugInfo />

      {/* Feature explanation footer */}
      <div
        style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          fontSize: '14px',
        }}
      >
        <h4>✨ Features Demonstrated:</h4>
        <ul>
          <li>
            <strong>useReflexx with selector</strong> - Optimized re-renders
          </li>
          <li>
            <strong>useReflexxValue</strong> - Simple property access
          </li>
          <li>
            <strong>useReflexxHistory</strong> - Undo/redo with keyboard
            shortcuts
          </li>
          <li>
            <strong>useReflexxBatch</strong> - Atomic multiple updates
          </li>
          <li>
            <strong>IndexedDB persistence</strong> - Large data and user
            preferences
          </li>
          <li>
            <strong>localStorage persistence</strong> - Small, critical state
          </li>
          <li>
            <strong>Hydration handling</strong> - No UI flashes on load
          </li>
          <li>
            <strong>Devtools logging</strong> - Debug with console logs
          </li>
          <li>
            <strong>Action naming</strong> - Track changes in history
          </li>
          <li>
            <strong>Store registry</strong> - Access stores by name
          </li>
        </ul>

        <h4>📝 Try This:</h4>
        <ol>
          <li>Click increment/decrement - watch console logs</li>
          <li>Press Ctrl+Z / Ctrl+Y for undo/redo</li>
          <li>Toggle theme - persists after refresh</li>
          <li>Use "+5 Batch" - single history entry for multiple updates</li>
          <li>Save snapshots to IndexedDB</li>
          <li>Refresh page - state persists!</li>
        </ol>
      </div>
    </div>
  );
};

export default CounterApp;
```

```tsx
// demo/index.tsx - Entry point
import React from 'react';
import { createRoot } from 'react-dom/client';
import CounterApp from './CounterApp';

// Create root and render
const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <CounterApp />
  </React.StrictMode>,
);
```

## Detailed Explanation of Why Each Feature Was Used

### 1. **Two Different Stores with Different Persistence**

```typescript
const counterStore = createStore({...}, {
  persist: { storage: 'localStorage', whitelist: ['theme', 'count'] }
});

const analyticsStore = createStore({...}, {
  persist: { storage: 'indexedDB' }
});
```

**WHY:**

- `counterStore` uses localStorage because the data is small (just numbers and strings)
- `analyticsStore` uses IndexedDB because event logs can grow large over time
- Whitelist prevents saving unnecessary fields (like `lastAction` which is ephemeral)

### 2. **Selectors in useReflexx**

```typescript
const [count] = useReflexx(counterStore, (state) => state.count);
```

**WHY:** Performance optimization. The CounterDisplay component only re-renders when `count` changes. If `theme` or `lastAction` changes, this component stays unchanged, preventing wasted renders.

### 3. **Batch Updates**

```typescript
batchUpdates(
  [
    { updater: { count: count + 1 }, action: 'ADD_1' },
    { updater: { count: count + 2 }, action: 'ADD_2' },
    { updater: { count: count + 3 }, action: 'ADD_3' },
  ],
  'BATCH_INCREMENT_5',
);
```

**WHY:** Without batching, three separate updates would create three history entries and cause three re-renders. With batching, it's atomic - one history entry, one re-render. This is crucial for operations that should feel instantaneous.

### 4. **History with Debouncing**

```typescript
history: {
  maxVersions: 50,
  debounceTime: 300,  // Group rapid updates
  ignoreIdentical: true
}
```

**WHY:** If a user rapidly clicks increment 10 times, debouncing groups these into one history entry. This prevents history from being flooded with identical consecutive actions.

### 5. **Action Names**

```typescript
setTheme(newTheme, 'THEME_TOGGLE');
```

**WHY:** Action names appear in devtools and history info, making debugging significantly easier. You can see exactly what action caused each state change.

### 6. **Hydration Flag**

```typescript
const [state, setState, hydrated] = useReflexx(store);
if (!hydrated) return <LoadingSpinner />;
```

**WHY:** Prevents UI flashes. Without this, the component would render with initial state, then re-render when persisted state loads. The hydrated flag ensures we only render once the real data is ready.

### 7. **useIndexedDBItem for Preferences**

```typescript
const { value: preferences, updateValue: setPreferences } =
  useIndexedDBItem<UserPreferences>('user-preferences', defaultValue);
```

**WHY:** Perfect for settings that need to persist across sessions. Unlike useState, data survives page refresh. Unlike localStorage API, it's async (non-blocking) and can handle larger data.

### 8. **Keyboard Shortcuts**

```typescript
useEffect(() => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    undo();
  }
}, [undo]);
```

**WHY:** Professional apps need keyboard shortcuts. This provides the familiar Ctrl+Z/Ctrl+Y undo/redo experience users expect.

### 9. **Manual Store Access**

```typescript
counterStore.getState(); // Direct access
counterStore['loadFromStorage'](); // Force reload
```

**WHY:** Sometimes hooks aren't enough. You need direct store access for imperative operations like manual save/load or accessing state outside React components.

### 10. **Store Registry**

```typescript
const store = getStore<CounterState>('counter');
```

**WHY:** Allows accessing stores from anywhere in the codebase without importing the store instance directly. Useful for non-React code or dynamic store access.

## Performance Characteristics

| Operation        | Without Optimization           | With Reflexx                          |
| ---------------- | ------------------------------ | ------------------------------------- |
| Rapid clicks     | 10 renders, 10 history entries | 1 render, 1 history entry (debounced) |
| Multiple updates | 3 renders, 3 history entries   | 1 render, 1 history entry (batched)   |
| Theme change     | All components re-render       | Only theme-related components         |
| Page load        | Flash of default state         | Shows loader until hydrated           |

## When to Use Each Feature

| Feature                    | Use Case                                    |
| -------------------------- | ------------------------------------------- |
| `useReflexx` with selector | Most components - for performance           |
| `useReflexxValue`          | Simple components reading one property      |
| `useReflexxBatch`          | Operations that should feel atomic          |
| `useReflexxHistory`        | Any editable content (forms, editors, etc.) |
| `useIndexedDBItem`         | User preferences, large datasets            |
| `useIndexedDBStorage`      | Simple key-value with larger limits         |
| Action names               | All state changes - for debugging           |
| Devtools                   | Development only - never in production      |
| Hydration check            | Any component reading persisted state       |

This demo provides a complete, production-ready example of using every Reflexx feature with real-world use cases and performance optimizations!
