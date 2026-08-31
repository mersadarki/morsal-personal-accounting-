import { AlertCircle } from 'lucide-react';
import { COLORS } from '../../lib/constants';

export default function InstallmentReminder({ items }) {
  if (items.length === 0) return null;
  return (
    <div style={{ background: COLORS.expenseBg, border: `1px solid ${COLORS.expense}`, borderRadius: 12, padding: 12, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: COLORS.expense, fontWeight: 700, fontSize: 13 }}>
        <AlertCircle size={15} /> یادآوری قسط
      </div>
      {items.map((it) => (
        <div key={it.key} style={{ fontSize: 12.5, color: COLORS.ink, padding: '2px 0' }}>
          «{it.name}» {it.when === 'today' ? 'امروز' : 'فردا'} سررسیده.
        </div>
      ))}
    </div>
  );
}
