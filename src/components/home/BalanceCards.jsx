import { ACCOUNTS, ACCOUNT_LABELS, COLORS } from '../../lib/constants';
import { fmt } from '../../lib/format';

export default function BalanceCards({ latestBalances }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10, marginBottom: 6 }}>
        {ACCOUNTS.map((a) => (
          <div key={a} style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 10 }}>
            <div style={{ fontSize: 11, color: COLORS.inkLight, marginBottom: 4 }}>{ACCOUNT_LABELS[a]}</div>
            <div className="tabular" style={{ fontSize: 14, fontWeight: 800, color: COLORS.cover }}>
              {latestBalances && latestBalances.vals[a] != null ? fmt(latestBalances.vals[a]) : '—'}
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: COLORS.inkLight, marginBottom: 16, textAlign: 'center' }}>
        مبالغ به هزار تومان — مثلاً ۱٫۵۰۰ یعنی یک میلیون و پانصد هزار تومان{latestBalances ? ` · آخرین موجودی: ${latestBalances.month}` : ''}
      </div>
    </>
  );
}
