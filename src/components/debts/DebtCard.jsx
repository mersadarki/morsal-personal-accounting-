import { useState } from 'react';
import { Trash2, Plus, Pencil, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { COLORS } from '../../lib/constants';
import { fmt, parseMoneyShorthand } from '../../lib/format';
import { inputStyle, iconBtn, secondaryBtn, AmountPreview, UnitTag } from '../../lib/ui.jsx';

function EntryRow({ entry, debtId, onEditEntry, onDeleteEntry }) {
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  function startEdit() {
    setAmount(String(entry.delta));
    setNote(entry.note || '');
    setError('');
    setEditing(true);
  }
  function save(e) {
    e.preventDefault();
    const n = parseMoneyShorthand(amount);
    if (isNaN(n) || n === 0) { setError('مبلغ را درست وارد کنید.'); return; }
    onEditEntry(debtId, entry.id, n, note.trim());
    setEditing(false);
  }

  if (editing) {
    return (
      <form onSubmit={save} style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '7px 12px', borderTop: `1px solid ${COLORS.line}`, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 100px' }}>
          <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="مبلغ (+/- ، مثلاً ۵/۸۰۰)" style={{ ...inputStyle, width: '100%', fontSize: 12.5, padding: '6px 8px' }} />
          <AmountPreview value={amount} />
        </div>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="یادداشت..." style={{ ...inputStyle, flex: '2 1 120px', fontSize: 12.5, padding: '6px 8px' }} />
        <button type="submit" style={iconBtn(COLORS.income)}><Check size={13} /></button>
        <button type="button" onClick={() => setEditing(false)} style={iconBtn(COLORS.inkLight)}><X size={13} /></button>
        {error && <div style={{ color: COLORS.expense, fontSize: 11, flexBasis: '100%' }}>{error}</div>}
      </form>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderTop: `1px solid ${COLORS.line}` }}>
      <div style={{ flex: 1, fontSize: 12.5, color: COLORS.inkLight }}>{entry.note || '—'}</div>
      <div className="tabular" style={{ fontSize: 12.5, fontWeight: 700, color: entry.delta >= 0 ? COLORS.income : COLORS.expense }}>
        {entry.delta >= 0 ? '+' : ''}{fmt(entry.delta)}<UnitTag />
      </div>
      <button onClick={startEdit} style={iconBtn(COLORS.brassDark)}><Pencil size={12} /></button>
      <button onClick={() => onDeleteEntry(debtId, entry.id)} style={iconBtn(COLORS.expense)}><Trash2 size={12} /></button>
    </div>
  );
}

export default function DebtCard({ debt, onAddEntries, onEditEntry, onDeleteEntry, onDeletePerson }) {
  const [expanded, setExpanded] = useState(false);
  const [plus, setPlus] = useState('');
  const [minus, setMinus] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const total = debt.entries.reduce((s, e) => s + (e.delta || 0), 0);

  function submit(e) {
    e.preventDefault();
    const p = plus.trim() ? parseMoneyShorthand(plus) : null;
    const m = minus.trim() ? parseMoneyShorthand(minus) : null;
    if ((p == null || isNaN(p) || p <= 0) && (m == null || isNaN(m) || m <= 0)) {
      setError('حداقل یکی از دو مبلغ (بدهی جدید یا دریافتی) را وارد کنید.');
      return;
    }
    const items = [];
    if (p != null && !isNaN(p) && p > 0) items.push({ delta: p, note: note.trim() });
    if (m != null && !isNaN(m) && m > 0) items.push({ delta: -m, note: note.trim() });
    onAddEntries(debt.id, items);
    setPlus(''); setMinus(''); setNote(''); setError('');
  }

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: COLORS.paperDark, border: 'none', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {expanded ? <ChevronUp size={15} color={COLORS.inkLight} /> : <ChevronDown size={15} color={COLORS.inkLight} />}
          <div style={{ fontWeight: 700, fontSize: 14 }}>{debt.person}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="tabular" style={{ fontWeight: 800, fontSize: 14, color: total >= 0 ? COLORS.income : COLORS.expense }}>{fmt(total)}<UnitTag /></div>
          <span role="button" tabIndex={0} aria-label="حذف شخص" onClick={(e) => { e.stopPropagation(); onDeletePerson(debt.id); }} style={iconBtn(COLORS.expense)}><Trash2 size={13} /></span>
        </div>
      </button>
      {expanded && (
        <>
          {debt.entries.length > 0 && (
            <div>
              {debt.entries.map((en) => (
                <EntryRow key={en.id} entry={en} debtId={debt.id} onEditEntry={onEditEntry} onDeleteEntry={onDeleteEntry} />
              ))}
            </div>
          )}
          <form onSubmit={submit} style={{ padding: 10, borderTop: `1px solid ${COLORS.line}` }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 100px' }}>
                <div style={{ fontSize: 10.5, color: COLORS.income, marginBottom: 3, fontWeight: 700 }}>+ بدهی جدید</div>
                <input inputMode="decimal" value={plus} onChange={(e) => setPlus(e.target.value)} placeholder="مثلاً ۵/۸۰۰" style={{ ...inputStyle, width: '100%' }} />
                <AmountPreview value={plus} />
              </div>
              <div style={{ flex: '1 1 100px' }}>
                <div style={{ fontSize: 10.5, color: COLORS.expense, marginBottom: 3, fontWeight: 700 }}>− دریافتی</div>
                <input inputMode="decimal" value={minus} onChange={(e) => setMinus(e.target.value)} placeholder="مثلاً ۵/۸۰۰" style={{ ...inputStyle, width: '100%' }} />
                <AmountPreview value={minus} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="یادداشت..." style={{ ...inputStyle, flex: 1 }} />
              <button type="submit" style={{ ...secondaryBtn, flexShrink: 0 }}><Plus size={14} /> ثبت</button>
            </div>
          </form>
          {error && <div style={{ color: COLORS.expense, fontSize: 12, padding: '0 12px 10px' }}>{error}</div>}
        </>
      )}
    </div>
  );
}
