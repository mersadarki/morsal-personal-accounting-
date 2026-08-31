import { Plus } from 'lucide-react';
import { COLORS } from '../../lib/constants';

const btnStyle = {
  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
  padding: '9px 0', borderRadius: 9, border: `1px solid ${COLORS.line}`,
  background: COLORS.surface, color: COLORS.income, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
};

export default function QuickBalanceButtons({ onQuickAdd }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
      <button onClick={() => onQuickAdd('ملی')} style={btnStyle}><Plus size={13} /> ۵۰۰ به ملی</button>
      <button onClick={() => onQuickAdd('ویپاد')} style={btnStyle}><Plus size={13} /> ۵۰۰ به ویپاد</button>
    </div>
  );
}
