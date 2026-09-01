import { useState } from 'react';
import { Plus, ListPlus } from 'lucide-react';
import { COLORS, MONTHS } from '../../lib/constants';
import { toFaDigits, toEnglishDigits, monthInfo } from '../../lib/format';
import { inputStyle, selectStyle, primaryBtn, secondaryBtn, FieldLabel } from '../../lib/ui.jsx';
import InstallmentCard from './InstallmentCard';

const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);

export default function InstallmentsView({ installments, currentMonth, onAddPlan, onAddDate, onTogglePaid, onDeleteDate, onDeletePlan, onBulkAdd, onSetRecurring }) {
  const [name, setName] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('1');
  const [count, setCount] = useState('1');
  const [recurring, setRecurring] = useState(false);
  const [error, setError] = useState('');
  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState('');

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const d = parseInt(toEnglishDigits(day), 10);
    // Recurring never has a "starting month" or a batch count to pick —
    // it's always just "this month, this day", added one month at a time.
    if (recurring) {
      onAddPlan(name.trim(), true, currentMonth, d, 1);
      setName(''); setDay('1'); setRecurring(false); setError('');
      return;
    }
    const raw = month.trim();
    let normalizedMonth = '';
    if (raw) {
      const info = monthInfo(raw);
      if (info.idx === -1) { setError('اسم ماه رو نشناختم — مثلاً بنویس «مهر» یا «مهر ۱۴۰۵».'); return; }
      const year = info.year || monthInfo(currentMonth).year;
      if (!year) { setError('سال رو هم بنویس، مثلاً «مهر ۱۴۰۵».'); return; }
      normalizedMonth = `${MONTHS[info.idx]} ${toFaDigits(year)}`;
    }
    const c = Math.max(1, parseInt(toEnglishDigits(count), 10) || 1);
    onAddPlan(name.trim(), false, normalizedMonth, d, c);
    setName(''); setMonth(''); setDay('1'); setCount('1'); setError('');
  }

  function submitBulk(e) {
    e.preventDefault();
    if (!bulkText.trim()) return;
    onBulkAdd(bulkText);
    setBulkText(''); setShowBulk(false);
  }

  return (
    <div>
      <form onSubmit={submit} style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 10, marginBottom: 10 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم قسط/وام جدید..." style={{ ...inputStyle, width: '100%', marginBottom: 8 }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12.5, color: COLORS.inkLight, marginBottom: 8 }}>
          <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
          ماهانه و بدون پایان (مثل باشگاه) — هر ماه سررسید داره و تسویه نمی‌شه
        </label>
        {recurring ? (
          <div style={{ marginBottom: 8, maxWidth: 140 }}>
            <FieldLabel>روز سررسید</FieldLabel>
            <select value={day} onChange={(e) => setDay(e.target.value)} style={selectStyle}>
              {dayOptions.map((d) => <option key={d} value={d}>{toFaDigits(d)}</option>)}
            </select>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            <div style={{ flex: '2 1 120px' }}>
              <FieldLabel>ماه شروع (اختیاری)</FieldLabel>
              <input value={month} onChange={(e) => setMonth(e.target.value)} placeholder="مثلاً: مهر ۱۴۰۵" style={inputStyle} />
            </div>
            <div style={{ flex: '1 1 70px' }}>
              <FieldLabel>روز</FieldLabel>
              <select value={day} onChange={(e) => setDay(e.target.value)} style={selectStyle}>
                {dayOptions.map((d) => <option key={d} value={d}>{toFaDigits(d)}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 70px' }}>
              <FieldLabel>تعداد ماه</FieldLabel>
              <input inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value)} placeholder="۱" style={inputStyle} />
            </div>
          </div>
        )}
        <button type="submit" style={primaryBtn}><Plus size={15} /> افزودن</button>
        {error && <div style={{ color: COLORS.expense, fontSize: 12, marginTop: 8 }}>{error}</div>}
      </form>

      <button type="button" onClick={() => setShowBulk((v) => !v)} style={{ ...secondaryBtn, marginBottom: 10 }}>
        <ListPlus size={15} /> {showBulk ? 'بستن افزودن گروهی' : 'افزودن چند قسط با هم (مثلاً از یادداشت)'}
      </button>
      {showBulk && (
        <form onSubmit={submitBulk} style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 10, marginBottom: 14 }}>
          <div style={{ fontSize: 11.5, color: COLORS.inkLight, marginBottom: 6 }}>
            هر خط یک قسط: «مبلغ روز عنوان» — مثلاً:
            <br />۴/۹۷۰ ۱۶ ازکی
            <br />۱۱/۹۸۰ ۱۸ ویپاد
            <br />۱/۶۰۰ ۲۵ بیمه ثالث (۵ تا مونده)
            <br />همه با هم به‌صورت غیرماهانه ثبت می‌شن — هرکدوم که واقعاً ماهانه‌ست رو بعداً از خودش تیک بزن.
          </div>
          <textarea
            value={bulkText} onChange={(e) => setBulkText(e.target.value)} rows={5}
            placeholder={'۴/۹۷۰ ۱۶ ازکی\n۱۱/۹۸۰ ۱۸ ویپاد\n۴/۶۵۰ ۱۸ باشگاه'}
            style={{ ...inputStyle, width: '100%', marginBottom: 8, fontFamily: 'inherit', resize: 'vertical' }}
          />
          <button type="submit" style={primaryBtn}><Plus size={15} /> افزودن همه</button>
        </form>
      )}

      {installments.length === 0 && (
        <div style={{ padding: 30, textAlign: 'center', color: COLORS.inkLight, fontSize: 13, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12 }}>هنوز قسطی ثبت نشده.</div>
      )}
      {installments.map((p) => (
        <InstallmentCard key={p.id} plan={p} currentMonth={currentMonth} onAddDate={onAddDate} onTogglePaid={onTogglePaid} onDeleteDate={onDeleteDate} onDeletePlan={onDeletePlan} onSetRecurring={onSetRecurring} />
      ))}
    </div>
  );
}
