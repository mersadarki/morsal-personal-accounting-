import { ACCOUNTS, ACCOUNT_LABELS, INCOME_CAT_LABELS } from './constants';
import { toEnglishDigits } from './format';

export function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportExcel(tx, balances, monthInfo) {
  const XLSX = await import('xlsx');
  const rows = [...tx].sort((a, b) => (monthInfo(a.m).sortKey < monthInfo(b.m).sortKey ? -1 : 1)).map((r, i) => ({
    'ردیف': i + 1, 'ماه': r.m, 'روز': r.dt || '', 'نوع': r.t === 'e' ? 'هزینه' : 'درآمد',
    'دسته': r.t === 'e' ? (r.neda ? 'ندا' : '') : INCOME_CAT_LABELS[r.cat] || '',
    'حساب': ACCOUNT_LABELS[r.acc] || r.acc, 'عنوان': r.ti || '', 'مبلغ (هزار تومان)': r.a,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 6 }, { wch: 16 }, { wch: 6 }, { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 24 }, { wch: 14 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'تراکنش‌ها');
  const balRows = Object.entries(balances).map(([m, b]) => ({ 'ماه': m, ...b }));
  const ws2 = XLSX.utils.json_to_sheet(balRows);
  XLSX.utils.book_append_sheet(wb, ws2, 'موجودی پایان ماه');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  downloadBlob(wbout, 'دفتر-حساب.xlsx', 'application/octet-stream');
}

export function downloadBackup(tx, balances, currentMonth) {
  const payload = { version: 1, exportedAt: new Date().toISOString(), tx, balances, currentMonth };
  downloadBlob(JSON.stringify(payload, null, 2), `پشتیبان-دفتر-حساب-${Date.now()}.json`, 'application/json');
}

export function readSheet(file, cb) {
  const reader = new FileReader();
  reader.onload = async (evt) => {
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.read(evt.target.result, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      cb(null, XLSX.utils.sheet_to_json(ws, { defval: '' }));
    } catch (err) { cb(err); }
  };
  reader.readAsArrayBuffer(file);
}

export function parseNedaRows(rows) {
  const news = [];
  rows.forEach((row) => {
    const m = String(row['ماه'] || '').trim();
    const ti = String(row['عنوان'] || row['شرح'] || '').trim();
    const accRaw = String(row['حساب'] || 'ملی').trim();
    const acc = ACCOUNTS.indexOf(accRaw) > -1 ? accRaw : 'ملی';
    const dtRaw = row['روز'];
    const dt = dtRaw !== '' && dtRaw != null ? parseInt(toEnglishDigits(String(dtRaw)), 10) : null;
    const a = parseFloat(toEnglishDigits(String(row['مبلغ'])));
    if (m && !isNaN(a) && a > 0) news.push({ m, t: 'e', acc, a, ti, neda: true, dt: (dt && !isNaN(dt)) ? dt : null });
  });
  return news;
}

export function parseGeneralRows(rows) {
  const news = [];
  rows.forEach((row) => {
    const m = String(row['ماه'] || '').trim();
    const typeRaw = String(row['نوع'] || 'هزینه').trim();
    const t = typeRaw === 'درآمد' ? 'i' : 'e';
    const accRaw = String(row['حساب'] || 'ملی').trim();
    const acc = ACCOUNTS.indexOf(accRaw) > -1 ? accRaw : 'ملی';
    const dtRaw = row['روز'];
    const dt = dtRaw !== '' && dtRaw != null ? parseInt(toEnglishDigits(String(dtRaw)), 10) : null;
    const a = parseFloat(toEnglishDigits(String(row['مبلغ'])));
    const ti = String(row['عنوان'] || '').trim();
    if (!m || isNaN(a) || a <= 0) return;
    if (t === 'e') news.push({ m, t, acc, a, ti, neda: false, dt: (dt && !isNaN(dt)) ? dt : null });
    else {
      const catLabel = String(row['دسته'] || '').trim();
      let cat = 'vpn';
      if (catLabel.indexOf('کاپیتان') > -1) cat = 'kapitan';
      else if (catLabel.indexOf('خدمات') > -1) cat = 'khadamat';
      else if (catLabel.indexOf('جابجایی') > -1) cat = 'transfer';
      news.push({ m, t, acc, a, ti: '', cat, personalVpn: false, dt: (dt && !isNaN(dt)) ? dt : null });
    }
  });
  return news;
}
