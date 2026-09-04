import { ACCOUNT_LABELS } from './constants';

const APP_URL = 'https://mersadarki.github.io/morsal-personal-accounting-/';
const REPO_URL = 'https://github.com/mersadarki/morsal-personal-accounting-';

export function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function downloadSheet(rows, cols, sheetName, filename) {
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.json_to_sheet(rows);
  if (cols) ws['!cols'] = cols;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  downloadBlob(wbout, filename, 'application/octet-stream');
}

const expenseCols = [{ wch: 6 }, { wch: 16 }, { wch: 6 }, { wch: 12 }, { wch: 24 }, { wch: 14 }];

function ownExpenseRows(tx, monthInfo) {
  return tx.filter((r) => r.t === 'e' && !r.neda).slice().sort((a, b) => (monthInfo(a.m).sortKey < monthInfo(b.m).sortKey ? -1 : 1)).map((r, i) => ({
    'ردیف': i + 1, 'ماه': r.m, 'روز': r.dt || '', 'حساب': ACCOUNT_LABELS[r.acc] || r.acc, 'عنوان': r.ti || '', 'مبلغ (هزار تومان)': r.a,
  }));
}

function nedaExpenseRows(tx, monthInfo) {
  return tx.filter((r) => r.t === 'e' && r.neda).slice().sort((a, b) => (monthInfo(a.m).sortKey < monthInfo(b.m).sortKey ? -1 : 1)).map((r, i) => ({
    'ردیف': i + 1, 'ماه': r.m, 'روز': r.dt || '', 'حساب': ACCOUNT_LABELS[r.acc] || r.acc, 'عنوان': r.ti || '', 'مبلغ (هزار تومان)': r.a,
  }));
}

function debtsRows(debts) {
  const rows = [];
  debts.forEach((d) => {
    let total = 0;
    d.entries.forEach((e) => { total += e.delta || 0; rows.push({ 'شخص': d.person, 'یادداشت': e.note || '', 'مبلغ (+/-)': e.delta }); });
    rows.push({ 'شخص': d.person, 'یادداشت': 'جمع', 'مبلغ (+/-)': total });
  });
  return rows;
}

function installmentsRows(installments) {
  const rows = [];
  installments.forEach((p) => {
    p.entries.forEach((e) => { rows.push({ 'نام': p.name, 'ماه': e.m, 'روز': e.dt, 'وضعیت': e.paid ? 'پرداخت‌شده' : 'پرداخت‌نشده' }); });
  });
  return rows;
}

export function exportOwnExpenses(tx, monthInfo) {
  return downloadSheet(ownExpenseRows(tx, monthInfo), expenseCols, 'هزینه خودم', 'هزینه-خودم.xlsx');
}

export function exportNedaExpenses(tx, monthInfo) {
  return downloadSheet(nedaExpenseRows(tx, monthInfo), expenseCols, 'هزینه ندا', 'هزینه-ندا.xlsx');
}

export function exportDebts(debts) {
  return downloadSheet(debtsRows(debts), [{ wch: 16 }, { wch: 30 }, { wch: 14 }], 'بدهی', 'بدهی.xlsx');
}

export function exportInstallments(installments) {
  return downloadSheet(installmentsRows(installments), [{ wch: 16 }, { wch: 16 }, { wch: 6 }, { wch: 14 }], 'قسط', 'قسط.xlsx');
}

// One workbook, four sheets — so getting every export doesn't mean
// clicking four separate downloads.
export async function exportAllExcel(tx, monthInfo, debts, installments) {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  const wsOwn = XLSX.utils.json_to_sheet(ownExpenseRows(tx, monthInfo));
  wsOwn['!cols'] = expenseCols;
  XLSX.utils.book_append_sheet(wb, wsOwn, 'هزینه خودم');

  const wsNeda = XLSX.utils.json_to_sheet(nedaExpenseRows(tx, monthInfo));
  wsNeda['!cols'] = expenseCols;
  XLSX.utils.book_append_sheet(wb, wsNeda, 'هزینه ندا');

  const wsDebts = XLSX.utils.json_to_sheet(debtsRows(debts));
  wsDebts['!cols'] = [{ wch: 16 }, { wch: 30 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsDebts, 'بدهی');

  const wsInstallments = XLSX.utils.json_to_sheet(installmentsRows(installments));
  wsInstallments['!cols'] = [{ wch: 16 }, { wch: 16 }, { wch: 6 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsInstallments, 'قسط');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  downloadBlob(wbout, 'دفتر-حساب-همه.xlsx', 'application/octet-stream');
}

export function downloadBackup(tx, balances, debts, installments, currentMonth, shop) {
  const payload = {
    version: 3,
    exportedAt: new Date().toISOString(),
    appUrl: APP_URL,
    repoUrl: REPO_URL,
    tx, balances, debts, installments, currentMonth,
    ...(shop || {}),
  };
  downloadBlob(JSON.stringify(payload, null, 2), `پشتیبان-دفتر-حساب-${Date.now()}.json`, 'application/json');
}
