import { useState } from 'react';
import { Pencil, Trash2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { ACCOUNTS, ACCOUNT_LABELS, ACCOUNT_COLORS, INCOME_CAT_LABELS, COLORS } from '../../lib/constants';
import { toFaDigits } from '../../lib/format';
import { iconBtn, nedaBadge, secondaryBtn, Amount } from '../../lib/ui.jsx';

function TxRow({ r, onEdit, onDelete, confirmDeleteId, setConfirmDeleteId, indented }) {
  const isExpense = r.t === 'e';
  return (
    <div className="row" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', paddingRight: indented ? 28 : 12, borderBottom: `1px solid ${COLORS.line}` }}>
      <div style={{ width: 5, alignSelf: 'stretch', borderRadius: 3, background: ACCOUNT_COLORS[r.acc] || COLORS.line, flexShrink: 0 }} />
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
}

export default function TransactionList({
  type, monthLabel, rows, visibleCount, onShowMore, saving,
  confirmDeleteId, setConfirmDeleteId, onEdit, onDelete, groupByAccount,
}) {
  const [expandedAccs, setExpandedAccs] = useState(() => new Set());
  const visible = rows.slice(0, visibleCount);
  const isExpense = type === 'e';

  function toggleAcc(acc) {
    setExpandedAccs((prev) => {
      const next = new Set(prev);
      if (next.has(acc)) next.delete(acc); else next.add(acc);
      return next;
    });
  }

  let groups = null;
  if (groupByAccount) {
    const byAcc = new Map();
    visible.forEach((r) => {
      if (!byAcc.has(r.acc)) byAcc.set(r.acc, { acc: r.acc, total: 0, items: [] });
      const g = byAcc.get(r.acc);
      g.total += r.a || 0;
      g.items.push(r);
    });
    groups = ACCOUNTS.filter((a) => byAcc.has(a)).map((a) => byAcc.get(a));
  }

  return (
    <>
      <div style={{ fontSize: 12, color: COLORS.inkLight, marginBottom: 8 }}>
        {type === 'e' ? 'هزینه‌های' : 'درآمدهای'} {monthLabel} ({toFaDigits(rows.length)}) {saving && '· در حال ذخیره...'}
      </div>
      <div style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12, overflow: 'hidden' }}>
        {visible.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: COLORS.inkLight, fontSize: 13 }}>هنوز موردی برای این ماه ثبت نشده.</div>}
        {groupByAccount
          ? groups.map((g) => {
              const expanded = expandedAccs.has(g.acc);
              return (
                <div key={g.acc}>
                  <button
                    onClick={() => toggleAcc(g.acc)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: COLORS.paperDark, border: 'none', cursor: 'pointer', borderBottom: `1px solid ${COLORS.line}` }}
                  >
                    <div style={{ width: 5, alignSelf: 'stretch', borderRadius: 3, background: ACCOUNT_COLORS[g.acc] || COLORS.line, flexShrink: 0 }} />
                    {expanded ? <ChevronUp size={14} color={COLORS.inkLight} /> : <ChevronDown size={14} color={COLORS.inkLight} />}
                    <div style={{ flex: 1, textAlign: 'right', fontWeight: 700, fontSize: 13 }}>{ACCOUNT_LABELS[g.acc] || g.acc}</div>
                    <div style={{ fontSize: 11, color: COLORS.inkLight }}>{toFaDigits(g.items.length)} تراکنش</div>
                    <div className="tabular" style={{ fontWeight: 700, fontSize: 13, color: isExpense ? COLORS.expense : COLORS.income, whiteSpace: 'nowrap' }}>
                      <Amount value={g.total} sign={isExpense ? '−' : '+'} />
                    </div>
                  </button>
                  {expanded && g.items.map((r) => (
                    <TxRow key={r.id} r={r} onEdit={onEdit} onDelete={onDelete} confirmDeleteId={confirmDeleteId} setConfirmDeleteId={setConfirmDeleteId} indented />
                  ))}
                </div>
              );
            })
          : visible.map((r) => (
              <TxRow key={r.id} r={r} onEdit={onEdit} onDelete={onDelete} confirmDeleteId={confirmDeleteId} setConfirmDeleteId={setConfirmDeleteId} />
            ))}
      </div>
      {rows.length > visibleCount && (
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <button onClick={onShowMore} style={secondaryBtn}>نمایش بیشتر</button>
        </div>
      )}
    </>
  );
}
