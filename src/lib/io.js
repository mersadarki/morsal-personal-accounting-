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

export function exportOwnExpenses(tx, monthInfo) {
  const rows = tx.filter((r) => r.t === 'e' && !r.neda).slice().sort((a, b) => (monthInfo(a.m).sortKey < monthInfo(b.m).sortKey ? -1 : 1)).map((r, i) => ({
    'ردیف': i + 1, 'ماه': r.m, 'روز': r.dt || '', 'حساب': ACCOUNT_LABELS[r.acc] || r.acc, 'عنوان': r.ti || '', 'مبلغ (هزار تومان)': r.a,
  }));
  return downloadSheet(rows, [{ wch: 6 }, { wch: 16 }, { wch: 6 }, { wch: 12 }, { wch: 24 }, { wch: 14 }], 'هزینه خودم', 'هزینه-خودم.xlsx');
}

export function exportNedaExpenses(tx, monthInfo) {
  const rows = tx.filter((r) => r.t === 'e' && r.neda).slice().sort((a, b) => (monthInfo(a.m).sortKey < monthInfo(b.m).sortKey ? -1 : 1)).map((r, i) => ({
    'ردیف': i + 1, 'ماه': r.m, 'روز': r.dt || '', 'حساب': ACCOUNT_LABELS[r.acc] || r.acc, 'عنوان': r.ti || '', 'مبلغ (هزار تومان)': r.a,
  }));
  return downloadSheet(rows, [{ wch: 6 }, { wch: 16 }, { wch: 6 }, { wch: 12 }, { wch: 24 }, { wch: 14 }], 'هزینه ندا', 'هزینه-ندا.xlsx');
}

export function exportDebts(debts) {
  const rows = [];
  debts.forEach((d) => {
    let total = 0;
    d.entries.forEach((e) => { total += e.delta || 0; rows.push({ 'شخص': d.person, 'یادداشت': e.note || '', 'مبلغ (+/-)': e.delta }); });
    rows.push({ 'شخص': d.person, 'یادداشت': 'جمع', 'مبلغ (+/-)': total });
  });
  return downloadSheet(rows, [{ wch: 16 }, { wch: 30 }, { wch: 14 }], 'بدهی', 'بدهی.xlsx');
}

export function exportInstallments(installments) {
  const rows = [];
  installments.forEach((p) => {
    p.entries.forEach((e) => { rows.push({ 'نام': p.name, 'ماه': e.m, 'روز': e.dt, 'وضعیت': e.paid ? 'پرداخت‌شده' : 'پرداخت‌نشده' }); });
  });
  return downloadSheet(rows, [{ wch: 16 }, { wch: 16 }, { wch: 6 }, { wch: 14 }], 'قسط', 'قسط.xlsx');
}

export function downloadBackup(tx, balances, debts, installments, currentMonth) {
  const payload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    appUrl: APP_URL,
    repoUrl: REPO_URL,
    tx, balances, debts, installments, currentMonth,
  };
  downloadBlob(JSON.stringify(payload, null, 2), `پشتیبان-دفتر-حساب-${Date.now()}.json`, 'application/json');
}
