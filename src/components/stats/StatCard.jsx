import { COLORS } from '../../lib/constants';
import { fmt } from '../../lib/format';
import { UnitTag } from '../../lib/ui.jsx';

export default function StatCard({ label, value, color }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 11, color: COLORS.inkLight, marginBottom: 4 }}>{label}</div>
      <div className="tabular" style={{ fontSize: 15, fontWeight: 800, color }}>{fmt(value)}<UnitTag /></div>
    </div>
  );
}
