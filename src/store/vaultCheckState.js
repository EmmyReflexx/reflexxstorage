import { createStore } from '../Reflexx_Tools/reflexx-state';

/**
 * Vault Check State Store
 * Handles security parameters checking if an encrypted vault account profile is authenticated.
 */
export const vaultCheckStore = createStore(
  {
    account: false,
  },
  {
    name: 'vaultCheckStore',
    devtools: true,
    persist: {
      key: 'vaultCheckStore',
      storage: 'localStorage',
    },
  },
);
