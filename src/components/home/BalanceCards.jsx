import { Landmark, Wallet, Banknote, DollarSign } from 'lucide-react';
import { ACCOUNTS, ACCOUNT_LABELS, COLORS } from '../../lib/constants';
import { fmt } from '../../lib/format';
import { UnitTag } from '../../lib/ui.jsx';

// Distinct icon + brand-ish color per account, standing in for a bank logo
// (we don't embed actual bank trademarks) — ملی/اعتبار ملی share Bank Melli's
// green, ویپاد gets Pasargad's warm orange (it's a Pasargad wallet product),
// دلار a currency icon, نقدی a banknote icon.
const ACCOUNT_STYLE = {
  'ملی': { icon: Landmark, bg: '#0f6b3f', fg: '#fff' },
  'اعتبار ملی': { icon: Landmark, bg: '#0f6b3f', fg: '#fff' },
  'ویپاد': { icon: Wallet, bg: '#e07a1f', fg: '#fff' },
  'نقدی': { icon: Banknote, bg: COLORS.brassDark, fg: '#fff' },
  'دلار': { icon: DollarSign, bg: '#1a7a6e', fg: '#fff' },
};

export default function BalanceCards({ latestBalances }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 6 }}>
        {ACCOUNTS.map((a) => {
          const style = ACCOUNT_STYLE[a];
          const Icon = style.icon;
          return (
            <div key={a} style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 10, display: 'flex', alignItems: 'center', gap: 9, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: style.bg, color: style.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={17} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, color: COLORS.inkLight, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ACCOUNT_LABELS[a]}</div>
                <div className="tabular" style={{ fontSize: 14, fontWeight: 800, color: COLORS.cover }}>
                  {latestBalances && latestBalances.vals[a] != null ? (<>{fmt(latestBalances.vals[a])}<UnitTag /></>) : '—'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {latestBalances && (
        <div style={{ fontSize: 11, color: COLORS.inkLight, marginBottom: 16, textAlign: 'center' }}>
          آخرین موجودی: {latestBalances.month}
        </div>
      )}
    </>
  );
}
