import { createStore } from '../Reflexx_Tools/reflexx-state';

/**
 * Sign Up State Store
 * Temporarily tracks verification fields while registering incoming account structures.
 */
export const signUpChange = createStore(
  {
    password: '',
    confirmPassword: '',
  },
  {
    name: 'signUpChange',
  },
);
