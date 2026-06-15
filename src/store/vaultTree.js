import { createStore } from '../Reflexx_Tools/reflexx-state';

/**
 * Vault Tree Application Store
 * Manages the secure hierarchical directory structure for encrypted vault assets.
 * This store is isolated from the global file tree for security separation.
 */
export const vaultTree = createStore(
  {
    files: [
      {
        id: 'vault-root-1',
        name: 'secure-vault',
        type: 'folder',
        children: [
          {
            id: 'vault-2',
            name: 'encrypted-documents',
            type: 'folder',
            children: [
              {
                id: 'vault-3',
                name: 'passwords.enc',
                type: 'file',
                data: {
                  file: '',
                  size: '4.2 KB',
                  format: 'enc',
                  dateCreated: 'now',
                },
              },
              {
                id: 'vault-4',
                name: 'private-keys.enc',
                type: 'file',
                data: {
                  file: '',
                  size: '8.7 KB',
                  format: 'enc',
                  dateCreated: 'now',
                },
              },
            ],
          },
          {
            id: 'vault-5',
            name: 'financial-records',
            type: 'folder',
            children: [
              {
                id: 'vault-6',
                name: 'transactions.enc',
                type: 'file',
                data: {
                  file: '',
                  size: '124.3 KB',
                  format: 'enc',
                  dateCreated: 'now',
                },
              },
            ],
          },
          {
            id: 'vault-7',
            name: 'personal-data.enc',
            type: 'file',
            data: {
              file: '',
              size: '256.8 KB',
              format: 'enc',
              dateCreated: 'now',
            },
          },
        ],
      },
      {
        id: 'vault-8',
        name: 'recovery-backup',
        type: 'folder',
        children: [
          {
            id: 'vault-9',
            name: 'recovery-keys.enc',
            type: 'file',
            data: {
              file: '',
              size: '1.2 MB',
              format: 'enc',
              dateCreated: 'now',
            },
          },
          {
            id: 'vault-10',
            name: 'seed-phrase.enc',
            type: 'file',
            data: {
              file: '',
              size: '0.5 KB',
              format: 'enc',
              dateCreated: 'now',
            },
          },
        ],
      },
      {
        id: 'vault-11',
        name: 'vault-settings.enc',
        type: 'file',
        data: {
          file: '',
          size: '2.1 KB',
          format: 'enc',
          dateCreated: 'now',
        },
      },
    ],
  },
  {
    name: 'vaultTree',
    persist: {
      key: 'vaultTree',
      storage: 'indexedDB',
    },
  },
);
