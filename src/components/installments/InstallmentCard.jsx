import { useState } from 'react';
import { Trash2, Plus, Check } from 'lucide-react';
import { COLORS } from '../../lib/constants';
import { toFaDigits, toEnglishDigits } from '../../lib/format';
import { inputStyle, selectStyle, iconBtn, secondaryBtn, FieldLabel } from '../../lib/ui.jsx';

const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);

export default function InstallmentCard({ plan, onAddDate, onTogglePaid, onDeleteDate, onDeletePlan }) {
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('1');
  const [error, setError] = useState('');

  function submit(e) {
    e.preventDefault();
    if (!month.trim()) { setError('ماه را وارد کنید (مثلاً: مهر ۱۴۰۵).'); return; }
    const d = parseInt(toEnglishDigits(day), 10);
    onAddDate(plan.id, month.trim(), d);
    setMonth(''); setDay('1'); setError('');
  }

  const sorted = [...plan.entries].sort((a, b) => (a.paid === b.paid ? 0 : a.paid ? 1 : -1));

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: COLORS.paperDark }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{plan.name}</div>
        <button onClick={() => onDeletePlan(plan.id)} style={iconBtn(COLORS.expense)}><Trash2 size={13} /></button>
      </div>
      {sorted.length > 0 && (
        <div>
          {sorted.map((en) => (
            <div key={en.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderTop: `1px solid ${COLORS.line}`, opacity: en.paid ? 0.55 : 1 }}>
              <button
                onClick={() => onTogglePaid(plan.id, en.id)}
                aria-label={en.paid ? 'علامت‌گذاری به‌عنوان پرداخت‌نشده' : 'علامت‌گذاری به‌عنوان پرداخت‌شده'}
                title={en.paid ? 'پرداخت‌شده' : 'پرداخت‌نشده'}
                style={{ ...iconBtn(en.paid ? COLORS.income : COLORS.inkLight), border: `1.5px solid ${en.paid ? COLORS.income : COLORS.line}`, borderRadius: 6 }}
              >
                {en.paid ? <Check size={13} /> : null}
              </button>
              <div style={{ flex: 1, fontSize: 12.5, textDecoration: en.paid ? 'line-through' : 'none' }}>{en.m}</div>
              <div className="tabular" style={{ fontSize: 12.5, color: COLORS.inkLight }}>روز {toFaDigits(en.dt)}</div>
              <button onClick={() => onDeleteDate(plan.id, en.id)} style={iconBtn(COLORS.inkLight)}><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={submit} style={{ display: 'flex', gap: 6, padding: 10, borderTop: `1px solid ${COLORS.line}`, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: '2 1 120px' }}>
          <FieldLabel>ماه</FieldLabel>
          <input value={month} onChange={(e) => setMonth(e.target.value)} placeholder="مثلاً: مهر ۱۴۰۵" style={inputStyle} />
        </div>
        <div style={{ flex: '1 1 70px' }}>
          <FieldLabel>روز</FieldLabel>
          <select value={day} onChange={(e) => setDay(e.target.value)} style={selectStyle}>
            {dayOptions.map((d) => <option key={d} value={d}>{toFaDigits(d)}</option>)}
          </select>
        </div>
        <button type="submit" style={{ ...secondaryBtn, flexShrink: 0 }}><Plus size={14} /> افزودن</button>
      </form>
      {error && <div style={{ color: COLORS.expense, fontSize: 12, padding: '0 12px 10px' }}>{error}</div>}
    </div>
  );
}
