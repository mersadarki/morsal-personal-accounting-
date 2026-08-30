import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { COLORS } from '../lib/constants';
import { inputStyle, iconBtn } from '../lib/ui.jsx';

export default function CurrentMonthBar({ currentMonth, onChange }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: '10px 14px', marginBottom: 16 }}>
      <div style={{ fontSize: 13, color: COLORS.inkLight }}>ماه جاری</div>
      {editing ? (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="مثلاً: مهر ۱۴۰۵" style={{ ...inputStyle, width: 140 }} />
          <button onClick={() => { if (value.trim()) { onChange(value.trim()); setEditing(false); } }} style={iconBtn(COLORS.income)}><Check size={16} /></button>
          <button onClick={() => setEditing(false)} style={iconBtn(COLORS.inkLight)}><X size={16} /></button>
        </div>
      ) : (
        <button onClick={() => { setValue(currentMonth); setEditing(true); }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Vazirmatn' }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{currentMonth}</span>
          <Pencil size={13} color={COLORS.brassDark} />
        </button>
      )}
    </div>
  );
}
