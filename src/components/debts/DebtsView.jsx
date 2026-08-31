import { useState } from 'react';
import { Plus } from 'lucide-react';
import { COLORS } from '../../lib/constants';
import { inputStyle, primaryBtn, Amount } from '../../lib/ui.jsx';
import DebtCard from './DebtCard';

export default function DebtsView({ debts, onAddPerson, onAddEntries, onEditEntry, onDeleteEntry, onDeletePerson }) {
  const [name, setName] = useState('');

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAddPerson(name.trim());
    setName('');
  }

  const withTotal = debts.map((d) => ({ ...d, total: d.entries.reduce((s, en) => s + (en.delta || 0), 0) }));
  // Split into people who owe the user (طلب) and people the user owes
  // (بدهی) — mixing them into one signed grand total made it impossible
  // to tell at a glance which side of the ledger a given number was on.
  const owedToMe = withTotal.filter((d) => d.total >= 0);
  const owedByMe = withTotal.filter((d) => d.total < 0);
  const claimsTotal = owedToMe.reduce((s, d) => s + d.total, 0);
  const debtsTotal = owedByMe.reduce((s, d) => s + d.total, 0);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11.5, color: COLORS.inkLight, marginBottom: 4 }}>جمع طلب من (باید بگیرم)</div>
          <div className="tabular" style={{ fontSize: 15, fontWeight: 800, color: COLORS.income }}><Amount value={claimsTotal} /></div>
        </div>
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11.5, color: COLORS.inkLight, marginBottom: 4 }}>جمع بدهی من (باید بدم)</div>
          <div className="tabular" style={{ fontSize: 15, fontWeight: 800, color: COLORS.expense }}><Amount value={Math.abs(debtsTotal)} /></div>
        </div>
      </div>

      <form onSubmit={submit} style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم شخص جدید..." style={{ ...inputStyle, flex: 1 }} />
        <button type="submit" style={primaryBtn}><Plus size={15} /> افزودن</button>
      </form>

      {debts.length === 0 && (
        <div style={{ padding: 30, textAlign: 'center', color: COLORS.inkLight, fontSize: 13, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12 }}>هنوز شخصی ثبت نشده.</div>
      )}

      {owedToMe.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.income, marginBottom: 8 }}>طلب من — این‌ها بهم بدهکارن</div>
          {owedToMe.map((d) => (
            <DebtCard key={d.id} debt={d} onAddEntries={onAddEntries} onEditEntry={onEditEntry} onDeleteEntry={onDeleteEntry} onDeletePerson={onDeletePerson} />
          ))}
        </div>
      )}

      {owedByMe.length > 0 && (
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.expense, marginBottom: 8 }}>بدهی من — به این‌ها بدهکارم</div>
          {owedByMe.map((d) => (
            <DebtCard key={d.id} debt={d} onAddEntries={onAddEntries} onEditEntry={onEditEntry} onDeleteEntry={onDeleteEntry} onDeletePerson={onDeletePerson} />
          ))}
        </div>
      )}
    </div>
  );
}
