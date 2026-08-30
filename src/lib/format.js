import { MONTHS } from './constants';

export function toEnglishDigits(str) {
  if (str == null) return str;
  const fa = '۰۱۲۳۴۵۶۷۸۹', ar = '٠١٢٣٤٥٦٧٨٩';
  return String(str).replace(/[۰-۹٠-٩]/g, (c) => {
    const i1 = fa.indexOf(c); if (i1 > -1) return i1;
    const i2 = ar.indexOf(c); if (i2 > -1) return i2;
    return c;
  });
}
export function toFaDigits(n) {
  const en = '0123456789', fa = '۰۱۲۳۴۵۶۷۸۹';
  return String(n).replace(/[0-9]/g, (c) => fa[en.indexOf(c)]);
}

export function monthInfo(raw0) {
  const raw = (raw0 || '').trim();
  const yearMatch = toEnglishDigits(raw).match(/(1[34]\d{2})\s*$/);
  const year = yearMatch ? yearMatch[1] : null;
  const monthOnly = raw.replace(/[۰-۹0-9]{3,4}\s*$/, '').trim();
  let idx = MONTHS.findIndex((mm) => monthOnly.indexOf(mm) === 0);
  if (idx === -1) idx = MONTHS.findIndex((mm) => monthOnly.indexOf(mm) > -1);
  const sortKey = `${year || '0000'}-${String(idx > -1 ? idx + 1 : 0).padStart(2, '0')}`;
  return { year, idx, sortKey, label: raw || 'نامشخص' };
}

// amounts stored in "hezar toman" units; displayed with Persian digits, grouped by ٫
export function fmt(n) {
  if (n == null || isNaN(n)) return '۰';
  const rounded = Math.round(n);
  const neg = rounded < 0;
  const grouped = Math.abs(rounded).toLocaleString('en-US').replace(/,/g, '٫');
  return (neg ? '-' : '') + toFaDigits(grouped);
}

export function uid(list) { return list.reduce((m, r) => Math.max(m, r.id || 0), 0) + 1; }

export function isTransferExpenseTitle(title) { return (title || '').trim() === 'جابجایی'; }
export function isInstallmentTitle(title) { return (title || '').trim().indexOf('قسط') === 0; }
