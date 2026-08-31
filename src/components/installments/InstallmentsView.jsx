import { useState } from 'react';
import { Plus } from 'lucide-react';
import { COLORS } from '../../lib/constants';
import { inputStyle, primaryBtn } from '../../lib/ui.jsx';
import InstallmentCard from './InstallmentCard';

export default function InstallmentsView({ installments, currentMonth, onAddPlan, onAddDate, onTogglePaid, onDeleteDate, onDeletePlan }) {
  const [name, setName] = useState('');
  const [recurring, setRecurring] = useState(false);

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAddPlan(name.trim(), recurring);
    setName(''); setRecurring(false);
  }

  return (
    <div>
      <form onSubmit={submit} style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم قسط/وام جدید..." style={{ ...inputStyle, flex: 1 }} />
          <button type="submit" style={primaryBtn}><Plus size={15} /> افزودن</button>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12.5, color: COLORS.inkLight }}>
          <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
          ماهانه و بدون پایان (مثل باشگاه) — هر ماه سررسید داره و تسویه نمی‌شه
        </label>
      </form>

      {installments.length === 0 && (
        <div style={{ padding: 30, textAlign: 'center', color: COLORS.inkLight, fontSize: 13, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12 }}>هنوز قسطی ثبت نشده.</div>
      )}
      {installments.map((p) => (
        <InstallmentCard key={p.id} plan={p} currentMonth={currentMonth} onAddDate={onAddDate} onTogglePaid={onTogglePaid} onDeleteDate={onDeleteDate} onDeletePlan={onDeletePlan} />
      ))}
    </div>
  );
}
