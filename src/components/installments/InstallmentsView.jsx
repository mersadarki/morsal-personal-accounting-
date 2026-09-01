import { useState } from 'react';
import { Plus, ListPlus } from 'lucide-react';
import { COLORS } from '../../lib/constants';
import { inputStyle, primaryBtn, secondaryBtn } from '../../lib/ui.jsx';
import InstallmentCard from './InstallmentCard';

export default function InstallmentsView({ installments, currentMonth, onAddPlan, onAddDate, onTogglePaid, onDeleteDate, onDeletePlan, onBulkAdd }) {
  const [name, setName] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState('');

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAddPlan(name.trim(), recurring);
    setName(''); setRecurring(false);
  }

  function submitBulk(e) {
    e.preventDefault();
    if (!bulkText.trim()) return;
    onBulkAdd(bulkText);
    setBulkText(''); setShowBulk(false);
  }

  return (
    <div>
      <form onSubmit={submit} style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم قسط/وام جدید..." style={{ ...inputStyle, flex: 1 }} />
          <button type="submit" style={primaryBtn}><Plus size={15} /> افزودن</button>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12.5, color: COLORS.inkLight }}>
          <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
          ماهانه و بدون پایان (مثل باشگاه) — هر ماه سررسید داره و تسویه نمی‌شه
        </label>
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
            <br />چیزی که «تا مونده» داشته باشه غیرماهانه ثبت می‌شه، بقیه ماهانه.
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
        <InstallmentCard key={p.id} plan={p} currentMonth={currentMonth} onAddDate={onAddDate} onTogglePaid={onTogglePaid} onDeleteDate={onDeleteDate} onDeletePlan={onDeletePlan} />
      ))}
    </div>
  );
}
