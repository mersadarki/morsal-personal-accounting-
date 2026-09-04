import { Check, Trash2, X } from 'lucide-react';
import { COLORS, SHOP_CATEGORY_LABELS } from '../../lib/constants';
import { toFaDigits } from '../../lib/format';
import { Amount, iconBtn } from '../../lib/ui.jsx';

export default function SalesList({ title, rows, confirmDeleteId, setConfirmDeleteId, onDelete, emptyText }) {
  return (
    <>
      <div style={{ fontSize: 12, color: COLORS.inkLight, marginBottom: 8 }}>{title} ({toFaDigits(rows.length)})</div>
      <div style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12, overflow: 'hidden' }}>
        {rows.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: COLORS.inkLight, fontSize: 13 }}>{emptyText || 'موردی ثبت نشده.'}</div>}
        {rows.map((r) => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderBottom: `1px solid ${COLORS.line}` }}>
            <div style={{ width: 5, alignSelf: 'stretch', borderRadius: 3, background: r.category === 'accessory' ? COLORS.brass : COLORS.income, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.productName}</div>
              <div style={{ fontSize: 11, color: COLORS.inkLight }}>
                {SHOP_CATEGORY_LABELS[r.category]} · {toFaDigits(r.qty)} عدد{r.dt ? ` · روز ${toFaDigits(r.dt)}` : ''}{r.hm ? ` · ${toFaDigits(r.hm)}` : ''}
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div className="tabular" style={{ fontWeight: 700, fontSize: 13 }}><Amount value={r.totalSale} /></div>
              <div className="tabular" style={{ fontSize: 10.5, color: r.totalProfit >= 0 ? COLORS.income : COLORS.expense }}>
                سود: <Amount value={r.totalProfit} sign={r.totalProfit >= 0 ? '+' : ''} />
              </div>
            </div>
            {confirmDeleteId === r.id ? (
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => onDelete(r.id)} style={iconBtn(COLORS.expense)}><Check size={13} /></button>
                <button onClick={() => setConfirmDeleteId(null)} style={iconBtn(COLORS.inkLight)}><X size={13} /></button>
              </div>
            ) : (
              <button onClick={() => setConfirmDeleteId(r.id)} style={iconBtn(COLORS.expense)}><Trash2 size={13} /></button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
