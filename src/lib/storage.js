// Real, durable, cross-session storage for the client-only PWA.
// Backed by localStorage — persists across app restarts and browser sessions
// on the device, replacing the sandbox-only `window.storage` API used by the
// reference prototype. Same three logical stores: tx, balances, currentMonth.

export const TX_KEY = 'ledger-tx-v1';
export const BAL_KEY = 'ledger-balances-v1';
export const MONTH_KEY = 'ledger-current-month-v1';

export function storageGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? null : raw;
  } catch {
    return null;
  }
}

export function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
