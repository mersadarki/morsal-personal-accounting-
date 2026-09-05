import { useState, useEffect, useRef } from 'react';
import { Check, Landmark, Wallet } from 'lucide-react';
import { COLORS, ACCOUNT_COLORS } from '../../lib/constants';

// Same icon + color as the account everywhere else (balance cards,
// transaction rows) so ملی and ویپاد are unmistakable at a glance here too.
const ACCOUNT_ICON = { 'ملی': Landmark, 'ویپاد': Wallet };

const btnStyle = (account, confirmed) => ({
  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  padding: '9px 4px', borderRadius: 9, border: `1.5px solid ${confirmed ? COLORS.income : ACCOUNT_COLORS[account]}`,
  background: confirmed ? COLORS.incomeBg : `${ACCOUNT_COLORS[account]}14`,
  color: confirmed ? COLORS.income : ACCOUNT_COLORS[account], fontSize: 12.5, fontWeight: 700,
  cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s, color 0.2s',
});

// Briefly swaps the button's own label to a checkmark + "اضافه شد" after a
// tap, so it's unmistakable that the tap registered — the account balance
// and today's transaction list update immediately, but that happens lower
// on the page where it's easy to miss the connection to this button.
export default function QuickBalanceButtons({ onQuickAdd }) {
  const [confirmed, setConfirmed] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function handleClick(account) {
    onQuickAdd(account);
    setConfirmed(account);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setConfirmed(null), 1400);
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
      <button onClick={() => handleClick('ملی')} style={btnStyle('ملی', confirmed === 'ملی')}>
        {confirmed === 'ملی' ? <><Check size={13} /> اضافه شد</> : (
          <>
            <Landmark size={14} />
            <span style={{ fontWeight: 500, fontSize: 11.5 }}>۵۰۰ به</span>
            <span style={{ fontWeight: 800, fontSize: 15 }}>ملی</span>
          </>
        )}
      </button>
      <button onClick={() => handleClick('ویپاد')} style={btnStyle('ویپاد', confirmed === 'ویپاد')}>
        {confirmed === 'ویپاد' ? <><Check size={13} /> اضافه شد</> : (
          <>
            <Wallet size={14} />
            <span style={{ fontWeight: 500, fontSize: 11.5 }}>۵۰۰ به</span>
            <span style={{ fontWeight: 800, fontSize: 15 }}>ویپاد</span>
          </>
        )}
      </button>
    </div>
  );
}
