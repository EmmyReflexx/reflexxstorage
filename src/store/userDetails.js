import { createStore } from '../Reflexx_Tools/reflexx-state';

/**
 * User Details State Store
 * Manages active session profile metadata with persistent browser local storage sync.
 */
export const userDetails = createStore(
  {
    userDetails: '',
  },
  {
    name: 'userDetails',
    devtools: true,
    persist: {
      key: 'userDetails',
      storage: 'indexedDB',
    },
  },
);

// Custom secure encryption (XOR + Base64 + Character Shifting)
const SECRET = `6y[3.@wKC~N6rKkAm408$XX_&+fR9!zP^q[m]vWx2#K9pO#$:n`;

export function encryptPassword(password) {
  let encrypted = '';
  for (let i = 0; i < password.length; i++) {
    const charCode =
      password.charCodeAt(i) ^ SECRET.charCodeAt(i % SECRET.length);
    encrypted += String.fromCharCode(charCode);
  }
  return btoa(encrypted);
}

export function decryptPassword(encryptedData) {
  const decoded = atob(encryptedData);
  let decrypted = '';
  for (let i = 0; i < decoded.length; i++) {
    const charCode =
      decoded.charCodeAt(i) ^ SECRET.charCodeAt(i % SECRET.length);
    decrypted += String.fromCharCode(charCode);
  }
  return decrypted;
}

// Dear users, please remember that this encryption
// method is purely for demonstration purposes and should
// not be used in production environments. It is not secure
// against determined attackers. Always use well-established
// libraries and best practices for handling sensitive data in real applications.
