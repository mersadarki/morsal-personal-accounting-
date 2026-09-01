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

// Advances a "<month name> <year>" label by n months (n=0 returns the same
// month), e.g. advanceMonthLabel('شهریور ۱۴۰۵', 1) -> 'مهر ۱۴۰۵'. Used to
// bulk-generate N consecutive months of installment due dates from one
// starting month. Returns null if the label doesn't parse.
export function advanceMonthLabel(label, n) {
  const info = monthInfo(label);
  if (info.idx === -1 || !info.year) return null;
  let idx = info.idx + n;
  let year = parseInt(info.year, 10);
  year += Math.floor(idx / 12);
  idx = ((idx % 12) + 12) % 12;
  return `${MONTHS[idx]} ${toFaDigits(year)}`;
}

// amounts stored in "hezar toman" units; displayed with Persian digits,
// grouped by ٬ (the actual Arabic thousands separator — ٫ is a decimal
// point and reads as one, which is exactly what made a plain hezar-toman
// number like ۲٫۴۴۷ look like "2.447" instead of "2,447").
export function fmt(n) {
  if (n == null || isNaN(n)) return '۰';
  const rounded = Math.round(n);
  const neg = rounded < 0;
  const grouped = Math.abs(rounded).toLocaleString('en-US').replace(/,/g, '٬');
  return (neg ? '-' : '') + toFaDigits(grouped);
}
// Short unit tag ("هزار ت") — used only as an inline suffix inside the
// amount *input* field, where the value is always literally hezar-toman
// because that's what the user is typing.
export const UNIT_TAG = 'هزار ت';

// Adaptive magnitude formatter for *displayed* money: scales a hezar-toman
// amount up to هزار/میلیون/میلیارد تومان — whichever keeps the number
// small — instead of a long digit string whose real-world scale is easy
// to misjudge. Every stored amount is a whole number of hezar-toman, so
// the میلیون-tier fraction is computed with plain integer remainder math
// (exact — no float drift, and always the full 3 digits, e.g. 49٫500 not
// 49٫5) and always shown zero-padded to 3 places when non-zero. Only
// میلیارد-scale totals round their fraction to the nearest ~million toman.
export function fmtUnit(n) {
  if (n == null || isNaN(n) || n === 0) return { text: '۰', unit: 'هزار تومان' };
  const neg = n < 0;
  const absN = Math.round(Math.abs(n));
  let intPart, decDigits, unit;
  if (absN >= 1e6) {
    unit = 'میلیارد تومان';
    intPart = Math.floor(absN / 1e6);
    decDigits = Math.round((absN % 1e6) / 1000);
    if (decDigits === 1000) { intPart += 1; decDigits = 0; }
  } else if (absN >= 1000) {
    unit = 'میلیون تومان';
    intPart = Math.floor(absN / 1000);
    decDigits = absN % 1000;
  } else {
    unit = 'هزار تومان';
    intPart = absN;
    decDigits = 0;
  }
  const groupedInt = toFaDigits(intPart.toLocaleString('en-US').replace(/,/g, '٬'));
  const decStr = decDigits > 0 ? '٫' + toFaDigits(String(decDigits).padStart(3, '0')) : '';
  const text = (neg ? '-' : '') + groupedInt + decStr;
  return { text, unit };
}

export function uid(list) { return list.reduce((m, r) => Math.max(m, r.id || 0), 0) + 1; }

export function isTransferExpenseTitle(title) { return (title || '').trim().indexOf('جابجایی') > -1; }
export function isInstallmentTitle(title) { return (title || '').trim().indexOf('قسط') > -1; }
export function isVpnPartnerTitle(title) {
  const t = (title || '').trim();
  return t === 'امیر' || t === 'وحید';
}
export function isVpnNewExpenseTitle(title) { return (title || '').trim() === 'vpn new'; }
// Titles the user's own spreadsheet formula excludes from «کل هزینه»:
// جابجایی (internal transfer), امیر/وحید (vpn resale partner payout),
// «vpn new» (cost of the vpn-new scheme), قرض-titled (loans, not spending),
// and blank titles (bookkeeping placeholders).
export function isExcludedExpenseTitle(title) {
  const t = (title || '').trim();
  if (t === '') return true;
  if (t === 'vpn new') return true;
  if (isVpnPartnerTitle(t)) return true;
  if (t.indexOf('قرض') > -1) return true;
  if (isTransferExpenseTitle(t)) return true;
  return false;
}

export function jalaliToMonthLabel({ jy, jm }) { return `${MONTHS[jm - 1]} ${toFaDigits(jy)}`; }

// Debt amounts are often several million toman; "۵/۸۰۰" is shorthand for
// 5 million + 800 thousand toman = 5800 in the app's hezar-toman unit
// (same as typing "5800" directly) — easier to type accurately than
// counting zeros. Falls back to a plain number when there's no "/".
export function parseMoneyShorthand(str) {
  let s = toEnglishDigits(String(str || '').trim());
  if (!s) return NaN;
  let neg = false;
  if (s.indexOf('-') === 0) { neg = true; s = s.slice(1); }
  let val;
  if (s.indexOf('/') > -1) {
    const parts = s.split('/');
    const mil = parseFloat(parts[0]) || 0;
    const thousand = parseFloat(parts[1]) || 0;
    val = mil * 1000 + thousand;
  } else {
    val = parseFloat(s);
  }
  return neg ? -val : val;
}

// Live confirmation of what an amount field will actually record, spelled
// out in full toman regardless of whether it was typed plain ("8800") or
// as X/Y shorthand ("8/800") — so it's never ambiguous which one you used.
// Returns '' for empty/invalid input.
export function describeAmount(str) {
  const n = parseMoneyShorthand(str);
  if (isNaN(n) || n === 0) return '';
  const abs = Math.round(Math.abs(n));
  const billion = Math.floor(abs / 1000000);
  const million = Math.floor((abs % 1000000) / 1000);
  const thousand = abs % 1000;
  const words = [];
  if (billion > 0) words.push(`${toFaDigits(billion)} میلیارد`);
  if (million > 0) words.push(`${toFaDigits(million)} میلیون`);
  if (thousand > 0) words.push(`${toFaDigits(thousand)} هزار`);
  const fullToman = (Math.abs(n) * 1000).toLocaleString('en-US').replace(/,/g, '٬');
  return `${n < 0 ? '−' : ''}${toFaDigits(fullToman)} تومان (${words.join(' و ')} تومان)`;
}
