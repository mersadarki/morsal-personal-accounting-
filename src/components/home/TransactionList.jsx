import { Pencil, Trash2, Check, X } from 'lucide-react';
import { ACCOUNT_LABELS, INCOME_CAT_LABELS, COLORS } from '../../lib/constants';
import { toFaDigits } from '../../lib/format';
import { iconBtn, nedaBadge, secondaryBtn, Amount } from '../../lib/ui.jsx';

export default function TransactionList({
  type, monthLabel, rows, visibleCount, onShowMore, saving,
  confirmDeleteId, setConfirmDeleteId, onEdit, onDelete,
}) {
  const visible = rows.slice(0, visibleCount);
  return (
    <>
      <div style={{ fontSize: 12, color: COLORS.inkLight, marginBottom: 8 }}>
        {type === 'e' ? 'هزینه‌های' : 'درآمدهای'} {monthLabel} ({toFaDigits(rows.length)}) {saving && '· در حال ذخیره...'}
      </div>
      <div style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12, overflow: 'hidden' }}>
        {visible.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: COLORS.inkLight, fontSize: 13 }}>هنوز موردی برای این ماه ثبت نشده.</div>}
        {visible.map((r) => {
          const isExpense = r.t === 'e';
          return (
            <div key={r.id} className="row" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderBottom: `1px solid ${COLORS.line}` }}>
              <div style={{ width: 5, alignSelf: 'stretch', borderRadius: 3, background: isExpense ? COLORS.expense : COLORS.income, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {isExpense ? (r.ti || 'بدون عنوان') : INCOME_CAT_LABELS[r.cat]}
                  </div>
                  {isExpense && r.neda && <span style={nedaBadge}>N</span>}
                  {r.transfer && <span style={nedaBadge}>جابجایی</span>}
                  {r.loan && <span style={nedaBadge}>قرض</span>}
                </div>
                <div style={{ fontSize: 11, color: COLORS.inkLight }}>
                  {ACCOUNT_LABELS[r.acc] || r.acc}{r.dt ? ` · روز ${toFaDigits(r.dt)}` : ''}
                </div>
              </div>
              <div className="tabular" style={{ fontWeight: 700, fontSize: 13, color: isExpense ? COLORS.expense : COLORS.income, whiteSpace: 'nowrap' }}>
                <Amount value={r.a} sign={isExpense ? '−' : '+'} />
              </div>
              {confirmDeleteId === r.id ? (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => onDelete(r.id)} style={iconBtn(COLORS.expense)}><Check size={13} /></button>
                  <button onClick={() => setConfirmDeleteId(null)} style={iconBtn(COLORS.inkLight)}><X size={13} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => onEdit(r)} style={iconBtn(COLORS.brassDark)}><Pencil size={13} /></button>
                  <button onClick={() => setConfirmDeleteId(r.id)} style={iconBtn(COLORS.expense)}><Trash2 size={13} /></button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {rows.length > visibleCount && (
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <button onClick={onShowMore} style={secondaryBtn}>نمایش بیشتر</button>
        </div>
      )}
    </>
  );
}
