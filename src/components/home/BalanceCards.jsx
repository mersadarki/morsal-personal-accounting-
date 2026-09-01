import { Landmark, Wallet, Banknote, DollarSign, Pencil } from 'lucide-react';
import { ACCOUNTS, ACCOUNT_LABELS, COLORS } from '../../lib/constants';
import { Amount, iconBtn } from '../../lib/ui.jsx';

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

export default function BalanceCards({ latestBalances, onEditBalance }) {
  // دلار is a different currency, not toman, so it's excluded from the
  // toman total — mixing it in would silently add a dollar count to a
  // toman sum.
  const totalExclDollar = latestBalances
    ? ACCOUNTS.filter((a) => a !== 'دلار').reduce((s, a) => s + (latestBalances.vals[a] || 0), 0)
    : null;
  return (
    <>
      {latestBalances && (
        <div style={{ background: COLORS.cover, color: COLORS.paper, borderRadius: 12, padding: 12, marginBottom: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 3 }}>موجودی کل حساب‌ها (بدون دلار)</div>
          <div className="tabular" style={{ fontSize: 18, fontWeight: 800 }}><Amount value={totalExclDollar} /></div>
        </div>
      )}
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
                  {latestBalances && latestBalances.vals[a] != null ? <Amount value={latestBalances.vals[a]} account={a} /> : '—'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {latestBalances && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: COLORS.inkLight }}>آخرین موجودی: {latestBalances.month}</div>
          <button
            onClick={() => onEditBalance(latestBalances.month)}
            aria-label="ویرایش موجودی حساب‌ها"
            title="اشتباه زدی؟ اینجا درستش کن"
            style={{ ...iconBtn(COLORS.brassDark), width: 22, height: 22 }}
          >
            <Pencil size={12} />
          </button>
        </div>
      )}
    </>
  );
}
