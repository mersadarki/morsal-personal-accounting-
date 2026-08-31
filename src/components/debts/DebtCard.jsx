import { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { COLORS } from '../../lib/constants';
import { fmt, toEnglishDigits } from '../../lib/format';
import { inputStyle, iconBtn, secondaryBtn } from '../../lib/ui.jsx';

export default function DebtCard({ debt, onAddEntry, onDeleteEntry, onDeletePerson }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const total = debt.entries.reduce((s, e) => s + (e.delta || 0), 0);

  function submit(e) {
    e.preventDefault();
    const n = parseFloat(toEnglishDigits(amount));
    if (isNaN(n) || n === 0) { setError('مبلغ را وارد کنید (مثبت یا منفی).'); return; }
    onAddEntry(debt.id, n, note.trim());
    setAmount(''); setNote(''); setError('');
  }

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: COLORS.paperDark }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{debt.person}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="tabular" style={{ fontWeight: 800, fontSize: 14, color: total >= 0 ? COLORS.income : COLORS.expense }}>{fmt(total)}</div>
          <button onClick={() => onDeletePerson(debt.id)} style={iconBtn(COLORS.expense)}><Trash2 size={13} /></button>
        </div>
      </div>
      {debt.entries.length > 0 && (
        <div>
          {debt.entries.map((en) => (
            <div key={en.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderTop: `1px solid ${COLORS.line}` }}>
              <div style={{ flex: 1, fontSize: 12.5, color: COLORS.inkLight }}>{en.note || '—'}</div>
              <div className="tabular" style={{ fontSize: 12.5, fontWeight: 700, color: en.delta >= 0 ? COLORS.income : COLORS.expense }}>
                {en.delta >= 0 ? '+' : ''}{fmt(en.delta)}
              </div>
              <button onClick={() => onDeleteEntry(debt.id, en.id)} style={iconBtn(COLORS.inkLight)}><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={submit} style={{ display: 'flex', gap: 6, padding: 10, borderTop: `1px solid ${COLORS.line}`, flexWrap: 'wrap' }}>
        <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="مبلغ (+/-)" style={{ ...inputStyle, flex: '1 1 90px' }} />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="یادداشت..." style={{ ...inputStyle, flex: '2 1 140px' }} />
        <button type="submit" style={{ ...secondaryBtn, flexShrink: 0 }}><Plus size={14} /> افزودن</button>
      </form>
      {error && <div style={{ color: COLORS.expense, fontSize: 12, padding: '0 12px 10px' }}>{error}</div>}
    </div>
  );
}
