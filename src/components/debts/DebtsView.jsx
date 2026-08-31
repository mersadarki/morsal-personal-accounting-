import { useState } from 'react';
import { Plus } from 'lucide-react';
import { COLORS } from '../../lib/constants';
import { fmt } from '../../lib/format';
import { inputStyle, primaryBtn } from '../../lib/ui.jsx';
import DebtCard from './DebtCard';

export default function DebtsView({ debts, onAddPerson, onAddEntries, onEditEntry, onDeleteEntry, onDeletePerson }) {
  const [name, setName] = useState('');

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAddPerson(name.trim());
    setName('');
  }

  const grandTotal = debts.reduce((s, d) => s + d.entries.reduce((s2, en) => s2 + (en.delta || 0), 0), 0);

  return (
    <div>
      <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 14, marginBottom: 14, textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: COLORS.inkLight, marginBottom: 4 }}>مجموع بدهی‌ها (هزار تومان)</div>
        <div className="tabular" style={{ fontSize: 22, fontWeight: 800, color: grandTotal >= 0 ? COLORS.income : COLORS.expense }}>{fmt(grandTotal)}</div>
        <div style={{ fontSize: 10.5, color: COLORS.inkLight, marginTop: 4 }}>عدد مثبت یعنی طرف بهتون بدهکاره، منفی یعنی شما بدهکارید</div>
      </div>

      <form onSubmit={submit} style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم شخص جدید..." style={{ ...inputStyle, flex: 1 }} />
        <button type="submit" style={primaryBtn}><Plus size={15} /> افزودن</button>
      </form>

      {debts.length === 0 && (
        <div style={{ padding: 30, textAlign: 'center', color: COLORS.inkLight, fontSize: 13, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12 }}>هنوز شخصی ثبت نشده.</div>
      )}
      {debts.map((d) => (
        <DebtCard key={d.id} debt={d} onAddEntries={onAddEntries} onEditEntry={onEditEntry} onDeleteEntry={onDeleteEntry} onDeletePerson={onDeletePerson} />
      ))}
    </div>
  );
}
