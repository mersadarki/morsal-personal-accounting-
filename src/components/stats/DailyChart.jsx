import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../lib/constants';
import { fmtUnit } from '../../lib/format';

export default function DailyChart({ data, title, color }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 12, marginBottom: 14 }}>
      <div style={{ fontSize: 12, color: COLORS.inkLight, marginBottom: 8 }}>{title || 'پراکندگی هزینه‌ها در روزهای ماه'}</div>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} />
            <XAxis dataKey="day" tick={{ fontSize: 8, fill: COLORS.inkLight }} interval={0} angle={-90} textAnchor="end" height={28} />
            <YAxis tick={{ fontSize: 9, fill: COLORS.inkLight }} width={30} />
            <Tooltip formatter={(v) => { const a = fmtUnit(v); return `${a.text} ${a.unit}`; }} contentStyle={{ fontFamily: 'Vazirmatn', fontSize: 11, direction: 'rtl' }} />
            <Bar dataKey="amount" fill={color || COLORS.expense} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
