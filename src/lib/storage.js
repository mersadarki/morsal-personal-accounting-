// Real, durable, cross-session storage for the client-only PWA.
// Backed by localStorage — persists across app restarts and browser sessions
// on the device, replacing the sandbox-only `window.storage` API used by the
// reference prototype.

export const TX_KEY = 'ledger-tx-v1';
export const BAL_KEY = 'ledger-balances-v1';
export const MONTH_KEY = 'ledger-current-month-v1';
export const DEBTS_KEY = 'ledger-debts-v1';
export const INSTALLMENTS_KEY = 'ledger-installments-v1';
export const SHOP_PRODUCTS_KEY = 'shop-products-v1';
export const SHOP_SALES_KEY = 'shop-sales-v1';
export const SHOP_PURCHASES_KEY = 'shop-purchases-v1';
export const SHOP_ARCHIVES_KEY = 'shop-archives-v1';
export const SHOP_SETTINGS_KEY = 'shop-settings-v1';

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
