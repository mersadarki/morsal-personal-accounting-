import { useState, useEffect, useRef } from 'react';
import { Plus, Check } from 'lucide-react';
import { COLORS } from '../../lib/constants';

const btnStyle = (confirmed) => ({
  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
  padding: '9px 0', borderRadius: 9, border: `1px solid ${confirmed ? COLORS.income : COLORS.line}`,
  background: confirmed ? COLORS.incomeBg : COLORS.surface, color: COLORS.income, fontSize: 12.5, fontWeight: 700,
  cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s',
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
      <button onClick={() => handleClick('ملی')} style={btnStyle(confirmed === 'ملی')}>
        {confirmed === 'ملی' ? <><Check size={13} /> اضافه شد</> : <><Plus size={13} /> ۵۰۰ به ملی</>}
      </button>
      <button onClick={() => handleClick('ویپاد')} style={btnStyle(confirmed === 'ویپاد')}>
        {confirmed === 'ویپاد' ? <><Check size={13} /> اضافه شد</> : <><Plus size={13} /> ۵۰۰ به ویپاد</>}
      </button>
    </div>
  );
}
