import { useState } from 'react';
import { Plus } from 'lucide-react';
import { COLORS } from '../../lib/constants';
import { inputStyle, primaryBtn } from '../../lib/ui.jsx';
import InstallmentCard from './InstallmentCard';

export default function InstallmentsView({ installments, onAddPlan, onAddDate, onTogglePaid, onDeleteDate, onDeletePlan }) {
  const [name, setName] = useState('');

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAddPlan(name.trim());
    setName('');
  }

  return (
    <div>
      <form onSubmit={submit} style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم قسط/وام جدید..." style={{ ...inputStyle, flex: 1 }} />
        <button type="submit" style={primaryBtn}><Plus size={15} /> افزودن</button>
      </form>

      {installments.length === 0 && (
        <div style={{ padding: 30, textAlign: 'center', color: COLORS.inkLight, fontSize: 13, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12 }}>هنوز قسطی ثبت نشده.</div>
      )}
      {installments.map((p) => (
        <InstallmentCard key={p.id} plan={p} onAddDate={onAddDate} onTogglePaid={onTogglePaid} onDeleteDate={onDeleteDate} onDeletePlan={onDeletePlan} />
      ))}
    </div>
  );
}
