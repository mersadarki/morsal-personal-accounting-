import { useState } from 'react';
import { Trash2, Plus, Check, X, Pencil, ChevronDown, ChevronUp, Repeat, AlertCircle } from 'lucide-react';
import { COLORS, MONTHS } from '../../lib/constants';
import { toFaDigits, toEnglishDigits, monthInfo, parseMoneyShorthand } from '../../lib/format';
import { inputStyle, selectStyle, iconBtn, secondaryBtn, FieldLabel, Amount, AmountInput } from '../../lib/ui.jsx';

const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);

export default function InstallmentCard({ plan, currentMonth, onAddDate, onTogglePaid, onDeleteDate, onDeletePlan, onSetRecurring, onEditPlan }) {
  const [expanded, setExpanded] = useState(false);
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('1');
  const [count, setCount] = useState('1');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(plan.name);
  const [editAmount, setEditAmount] = useState(plan.amount != null ? String(plan.amount) : '');

  function startEdit(e) {
    e.stopPropagation();
    setEditName(plan.name);
    setEditAmount(plan.amount != null ? String(plan.amount) : '');
    setEditing(true);
    setExpanded(true);
  }
  function saveEdit(e) {
    e.stopPropagation();
    const amt = editAmount.trim() ? parseMoneyShorthand(editAmount) : NaN;
    onEditPlan(plan.id, { name: editName.trim() || plan.name, amount: editAmount.trim() && !isNaN(amt) ? amt : null });
    setEditing(false);
  }
  function cancelEdit(e) {
    e.stopPropagation();
    setEditing(false);
  }

  function submit(e) {
    e.preventDefault();
    const d = parseInt(toEnglishDigits(day), 10);
    // Recurring never has a "starting month" or a batch count to pick —
    // it's always just "this month, this day", added one month at a time.
    if (plan.recurring) {
      onAddDate(plan.id, currentMonth, d, 1);
      setDay('1'); setError('');
      return;
    }
    // Blank month = current month, so this one form also covers the
    // common "just add this month's due date" case without a second,
    // separate day picker for that.
    const raw = month.trim() || currentMonth;
    const info = monthInfo(raw);
    if (info.idx === -1) { setError('اسم ماه رو نشناختم — مثلاً بنویس «مهر» یا «مهر ۱۴۰۵».'); return; }
    // A month typed without its year (easy to forget, e.g. just "شهریور")
    // used to silently break bulk-generation past the first entry, since
    // there was no year to advance from — default it to the current
    // month's year instead of failing.
    const year = info.year || monthInfo(currentMonth).year;
    if (!year) { setError('سال رو هم بنویس، مثلاً «مهر ۱۴۰۵».'); return; }
    const normalizedMonth = `${MONTHS[info.idx]} ${toFaDigits(year)}`;
    const c = Math.max(1, parseInt(toEnglishDigits(count), 10) || 1);
    onAddDate(plan.id, normalizedMonth, d, c);
    setMonth(''); setDay('1'); setCount('1'); setError('');
  }

  const sorted = [...plan.entries].sort((a, b) => (a.paid === b.paid ? 0 : a.paid ? 1 : -1));
  const remaining = plan.entries.filter((en) => !en.paid).length;
  const thisMonthEntry = plan.entries.find((en) => en.m === currentMonth);

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
      <div
        onClick={() => { if (!editing) setExpanded((v) => !v); }}
        style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 12px', background: COLORS.paperDark, cursor: editing ? 'default' : 'pointer' }}
      >
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="اسم قسط"
                style={{ ...inputStyle, width: '100%', marginBottom: 6 }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                {expanded ? <ChevronUp size={15} color={COLORS.inkLight} /> : <ChevronDown size={15} color={COLORS.inkLight} />}
                <div style={{ fontWeight: 700, fontSize: 14 }}>{plan.name}</div>
                {plan.recurring && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, background: COLORS.brassDark + '22', color: COLORS.brassDark, padding: '1px 6px', borderRadius: 6, fontWeight: 700 }}>
                    <Repeat size={10} /> ماهانه
                  </span>
                )}
              </div>
            )}
            {editing ? (
              <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 220 }}>
                <AmountInput value={editAmount} onChange={(e) => setEditAmount(e.target.value)} />
              </div>
            ) : plan.amount != null ? (
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.expense, paddingRight: 21, marginTop: 1 }}>
                <Amount value={plan.amount} />
              </div>
            ) : null}
            {!editing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingRight: 21, fontSize: 11, fontWeight: 600, color: thisMonthEntry ? (thisMonthEntry.paid ? COLORS.income : COLORS.expense) : COLORS.inkLight, marginTop: 2 }}>
                {thisMonthEntry ? (thisMonthEntry.paid ? <Check size={11} /> : <AlertCircle size={11} />) : (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.inkLight, flexShrink: 0 }} />
                )}
                {thisMonthEntry
                  ? `روز ${toFaDigits(thisMonthEntry.dt)} — ${thisMonthEntry.paid ? 'پرداخت شد' : 'پرداخت نشده'}`
                  : `سررسید ${currentMonth} هنوز ثبت نشده`}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            {editing ? (
              <>
                <span role="button" tabIndex={0} aria-label="ذخیره تغییرات" onClick={saveEdit} style={iconBtn(COLORS.income)}><Check size={15} /></span>
                <span role="button" tabIndex={0} aria-label="انصراف از ویرایش" onClick={cancelEdit} style={iconBtn(COLORS.inkLight)}><X size={15} /></span>
              </>
            ) : (
              <>
                <div style={{ fontSize: 12, color: COLORS.inkLight, whiteSpace: 'nowrap' }}>{plan.recurring ? '' : (remaining > 0 ? `${toFaDigits(remaining)} مونده` : 'تسویه')}</div>
                <span role="button" tabIndex={0} aria-label="ویرایش قسط" onClick={startEdit} style={iconBtn(COLORS.inkLight)}><Pencil size={13} /></span>
                <span role="button" tabIndex={0} aria-label="حذف قسط" onClick={(e) => { e.stopPropagation(); onDeletePlan(plan.id); }} style={iconBtn(COLORS.expense)}><Trash2 size={13} /></span>
              </>
            )}
          </div>
        </div>
      </div>
      {expanded && (
        <>
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
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: COLORS.inkLight, padding: '8px 12px', borderTop: `1px solid ${COLORS.line}` }}>
            <input type="checkbox" checked={!!plan.recurring} onChange={(e) => onSetRecurring(plan.id, e.target.checked)} />
            ماهانه و بدون پایان (مثل باشگاه) — هر ماه سررسید داره و تسویه نمی‌شه
          </label>
          <form onSubmit={submit} style={{ display: 'flex', gap: 6, padding: 10, borderTop: `1px solid ${COLORS.line}`, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            {plan.recurring ? (
              <div style={{ flex: '1 1 90px' }}>
                <FieldLabel>روز سررسید</FieldLabel>
                <select value={day} onChange={(e) => setDay(e.target.value)} style={selectStyle}>
                  {dayOptions.map((d) => <option key={d} value={d}>{toFaDigits(d)}</option>)}
                </select>
              </div>
            ) : (
              <>
                <div style={{ flex: '2 1 120px' }}>
                  <FieldLabel>ماه شروع (خالی = {currentMonth})</FieldLabel>
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
              </>
            )}
            <button type="submit" style={{ ...secondaryBtn, flexShrink: 0 }}>
              <Plus size={14} /> {!plan.recurring && Number(toEnglishDigits(count)) > 1 ? `افزودن ${toFaDigits(count)} ماه` : 'افزودن'}
            </button>
          </form>
          {!plan.recurring && (
            <div style={{ fontSize: 10.5, color: COLORS.inkLight, padding: '0 12px 8px' }}>
              با تعداد ماه بیشتر از ۱، همون روز برای چند ماه پشت‌سرهم شروع از «ماه شروع» ثبت می‌شه.
            </div>
          )}
          {error && <div style={{ color: COLORS.expense, fontSize: 12, padding: '0 12px 10px' }}>{error}</div>}
        </>
      )}
    </div>
  );
}
