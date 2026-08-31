import { COLORS } from './constants';
import { describeAmount } from './format';

export const fontStyle = { fontFamily: "'Vazirmatn', sans-serif" };
export const displayStyle = { fontFamily: "'Lalezar', cursive" };

export const tabStyle = (active) => ({ padding: '7px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'Vazirmatn', fontSize: 13, fontWeight: 600, background: active ? COLORS.brass : 'transparent', color: active ? COLORS.cover : COLORS.paper });
export const subTabStyle = (active) => ({ padding: '7px 8px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'Vazirmatn', fontSize: 12, fontWeight: 600, background: active ? COLORS.cover : 'transparent', color: active ? COLORS.paper : COLORS.inkLight });
export const primaryBtn = { display: 'inline-flex', alignItems: 'center', gap: 6, background: COLORS.cover, color: COLORS.paper, border: 'none', borderRadius: 9, padding: '9px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Vazirmatn' };
export const secondaryBtn = { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', color: COLORS.cover, border: `1px solid ${COLORS.line}`, borderRadius: 9, padding: '9px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Vazirmatn' };
export const inputStyle = { border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: '9px 10px', fontSize: 16, background: '#fff', color: COLORS.ink, outline: 'none' };
export const selectStyle = { border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: '9px 8px', fontSize: 16, background: '#fff', color: COLORS.ink, outline: 'none' };
export const iconBtn = (color) => ({ width: 28, height: 28, borderRadius: 7, border: 'none', background: 'transparent', color, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' });
export const typeToggle = (active, color) => ({ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0', borderRadius: 9, border: `1.5px solid ${active ? color : COLORS.line}`, background: active ? color + '22' : '#fff', color: active ? color : COLORS.inkLight, fontFamily: 'Vazirmatn', fontSize: 13, fontWeight: 600, cursor: 'pointer' });
export const quickBtn = { flex: 1, padding: '7px 0', borderRadius: 8, border: `1px solid ${COLORS.line}`, background: COLORS.paperDark, color: COLORS.ink, fontFamily: 'Vazirmatn', fontSize: 12, cursor: 'pointer' };
export const nedaBadge = { fontSize: 10, background: COLORS.expenseBg, color: COLORS.expense, padding: '1px 6px', borderRadius: 6, fontWeight: 700, flexShrink: 0 };

export function FieldLabel({ children }) {
  return <div style={{ fontSize: 11, color: COLORS.inkLight, marginBottom: 4 }}>{children}</div>;
}

// Live confirmation shown under an amount field so it's never ambiguous
// what a plain number vs an "X/Y" shorthand entry actually recorded.
export function AmountPreview({ value }) {
  const text = describeAmount(value);
  if (!text) return null;
  return <div style={{ fontSize: 11, color: COLORS.brassDark, marginTop: 3 }}>= {text}</div>;
}
