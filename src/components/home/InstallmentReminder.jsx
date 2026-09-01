import { AlertCircle, X } from 'lucide-react';
import { COLORS } from '../../lib/constants';
import { iconBtn } from '../../lib/ui.jsx';

export default function InstallmentReminder({ items, onDismiss }) {
  if (items.length === 0) return null;
  return (
    <div style={{ background: COLORS.expenseBg, border: `1px solid ${COLORS.expense}`, borderRadius: 12, padding: 12, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: COLORS.expense, fontWeight: 700, fontSize: 13 }}>
        <AlertCircle size={15} /> یادآوری قسط
      </div>
      {items.map((it) => (
        <div key={it.key} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0' }}>
          <div style={{ flex: 1, fontSize: 12.5, color: COLORS.ink }}>
            «{it.name}» {it.when === 'today' ? 'امروز' : 'فردا'} سررسیده.
          </div>
          <button
            onClick={() => onDismiss(it.planId, it.entryId)}
            aria-label="پرداخت کردم — این یادآوری رو بردار"
            title="پرداخت کردم"
            style={{ ...iconBtn(COLORS.expense), width: 22, height: 22, flexShrink: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
