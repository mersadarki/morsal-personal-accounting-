import { Pencil, Trash2, Check, X } from 'lucide-react';
import { ACCOUNTS, ACCOUNT_LABELS, COLORS } from '../../lib/constants';
import { monthInfo } from '../../lib/format';
import { iconBtn, Amount } from '../../lib/ui.jsx';
import SettingsSection from './SettingsSection';

export default function BalancesSection({
  balances, onEdit, confirmDeleteBal, setConfirmDeleteBal, onDelete,
}) {
  const entries = Object.entries(balances).sort((a, b) => (monthInfo(a[0]).sortKey < monthInfo(b[0]).sortKey ? 1 : -1));
  return (
    <SettingsSection title="موجودی پایان ماه">
      {entries.length === 0 && (
        <div style={{ padding: 20, textAlign: 'center', color: COLORS.inkLight, fontSize: 13 }}>هنوز موجودی‌ای ثبت نشده.</div>
      )}
      {entries.map(([m, b]) => (
        <div key={m} style={{ border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 12, marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{m}</div>
            {confirmDeleteBal === m ? (
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => onDelete(m)} style={iconBtn(COLORS.expense)}><Check size={13} /></button>
                <button onClick={() => setConfirmDeleteBal(null)} style={iconBtn(COLORS.inkLight)}><X size={13} /></button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => onEdit(m)} style={iconBtn(COLORS.brassDark)}><Pencil size={13} /></button>
                <button onClick={() => setConfirmDeleteBal(m)} style={iconBtn(COLORS.expense)}><Trash2 size={13} /></button>
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 6 }}>
            {ACCOUNTS.map((a) => b[a] != null && (
              <div key={a}>
                <div style={{ fontSize: 10, color: COLORS.inkLight }}>{ACCOUNT_LABELS[a]}</div>
                <div className="tabular" style={{ fontSize: 12, fontWeight: 700 }}><Amount value={b[a]} account={a} /></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </SettingsSection>
  );
}
