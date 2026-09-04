import { CalendarClock } from 'lucide-react';
import { MONTHS } from '../../lib/constants';
import { toFaDigits, toEnglishDigits } from '../../lib/format';
import { todayJalali } from '../../lib/jalali';
import { FieldLabel, selectStyle, quickBtn } from '../../lib/ui.jsx';

const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);

// Year/month/day pickers for a Jalali date, with an optional "امروز"
// shortcut — shared by sale/purchase/product/archive forms so a past year
// (previous-years detailed entry) is just as easy to pick as today.
export default function JalaliDateFields({ value, onChange, yearsBack = 8, showToday = true }) {
  const today = todayJalali();
  const years = Array.from({ length: yearsBack + 2 }, (_, i) => today.jy + 1 - i);

  function set(field, v) { onChange({ ...value, [field]: v }); }

  return (
    <div>
      <div style={{ display: 'flex', gap: 6 }}>
        <div style={{ flex: '1 1 90px' }}>
          <FieldLabel>سال</FieldLabel>
          <select value={value.jy} onChange={(e) => set('jy', parseInt(toEnglishDigits(e.target.value), 10))} style={{ ...selectStyle, width: '100%' }}>
            {years.map((y) => <option key={y} value={y}>{toFaDigits(y)}</option>)}
          </select>
        </div>
        <div style={{ flex: '2 1 120px' }}>
          <FieldLabel>ماه</FieldLabel>
          <select value={value.jm} onChange={(e) => set('jm', parseInt(e.target.value, 10))} style={{ ...selectStyle, width: '100%' }}>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div style={{ flex: '1 1 70px' }}>
          <FieldLabel>روز</FieldLabel>
          <select value={value.jd} onChange={(e) => set('jd', parseInt(toEnglishDigits(e.target.value), 10))} style={{ ...selectStyle, width: '100%' }}>
            {dayOptions.map((d) => <option key={d} value={d}>{toFaDigits(d)}</option>)}
          </select>
        </div>
      </div>
      {showToday && (value.jy !== today.jy || value.jm !== today.jm || value.jd !== today.jd) && (
        <button type="button" onClick={() => onChange({ ...today })} style={{ ...quickBtn, flex: 'none', marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px' }}>
          <CalendarClock size={12} /> برگشت به امروز
        </button>
      )}
    </div>
  );
}
