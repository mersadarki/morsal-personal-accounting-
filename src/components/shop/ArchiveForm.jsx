import { useState } from 'react';
import { Plus } from 'lucide-react';
import { COLORS, MONTHS, SHOP_CATEGORY_LABELS } from '../../lib/constants';
import { parseMoneyShorthand, toEnglishDigits, toFaDigits } from '../../lib/format';
import { todayJalali } from '../../lib/jalali';
import { AmountInput, AmountPreview, FieldLabel, inputStyle, primaryBtn, selectStyle } from '../../lib/ui.jsx';

const MONTH_ALL = '0';

// Covers both requested modes at once: leaving "ماه" on «کل سال» records
// one lump-sum row for the whole year (کلی); picking a specific month lets
// the same form be used once per month for a itemized-by-month history
// (جزیی) — same fields either way, just what "period" ends up meaning.
export default function ArchiveForm({ onAdd }) {
  const thisYear = todayJalali().jy;
  const [year, setYear] = useState(String(thisYear - 1));
  const [month, setMonth] = useState(MONTH_ALL);
  const [category, setCategory] = useState('');
  const [totalSales, setTotalSales] = useState('');
  const [totalProfit, setTotalProfit] = useState('');
  const [qty, setQty] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const years = Array.from({ length: 15 }, (_, i) => thisYear - i);

  function submit(e) {
    e.preventDefault();
    const y = parseInt(toEnglishDigits(year), 10);
    if (isNaN(y)) { setError('سال را درست وارد کنید.'); return; }
    const sales = parseMoneyShorthand(totalSales);
    if (isNaN(sales) || sales < 0) { setError('مبلغ کل فروش را درست وارد کنید.'); return; }
    const profit = totalProfit.trim() ? parseMoneyShorthand(totalProfit) : 0;
    onAdd({
      year: y, month: month === MONTH_ALL ? null : parseInt(month, 10), category: category || '',
      totalSales: sales, totalProfit: isNaN(profit) ? 0 : profit,
      qty: qty.trim() ? (parseInt(toEnglishDigits(qty), 10) || 0) : 0, note: note.trim(),
    });
    setTotalSales(''); setTotalProfit(''); setQty(''); setNote(''); setError('');
  }

  return (
    <form onSubmit={submit} style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
      <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>افزودن آمار سال‌های قبل</div>
      <div style={{ fontSize: 11.5, color: COLORS.inkLight, marginBottom: 10, lineHeight: 1.9 }}>
        برای هر سال یا فقط یک ردیف «کل سال» بزن، یا برای هر ماه یک ردیف جدا — نه هر دو با هم، وگرنه در آمار سالانه دوبار جمع می‌شه.
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <FieldLabel>سال</FieldLabel>
          <select value={year} onChange={(e) => setYear(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
            {years.map((y) => <option key={y} value={y}>{toFaDigits(y)}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel>دوره</FieldLabel>
          <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
            <option value={MONTH_ALL}>کل سال (کلی)</option>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m} (جزیی)</option>)}
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <FieldLabel>دسته (اختیاری)</FieldLabel>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
          <option value="">همه</option>
          <option value="phone">{SHOP_CATEGORY_LABELS.phone}</option>
          <option value="accessory">{SHOP_CATEGORY_LABELS.accessory}</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <FieldLabel>کل فروش</FieldLabel>
          <AmountInput value={totalSales} onChange={(e) => setTotalSales(e.target.value)} />
          <AmountPreview value={totalSales} />
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel>کل سود</FieldLabel>
          <AmountInput value={totalProfit} onChange={(e) => setTotalProfit(e.target.value)} />
          <AmountPreview value={totalProfit} />
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <FieldLabel>تعداد فروش‌رفته (اختیاری)</FieldLabel>
        <input inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
      </div>
      <FieldLabel>یادداشت (اختیاری)</FieldLabel>
      <input value={note} onChange={(e) => setNote(e.target.value)} style={{ ...inputStyle, width: '100%', marginBottom: 10 }} />
      {error && <div style={{ color: COLORS.expense, fontSize: 12, marginBottom: 8 }}>{error}</div>}
      <button type="submit" style={{ ...primaryBtn, width: '100%', justifyContent: 'center' }}><Plus size={15} /> افزودن</button>
    </form>
  );
}
