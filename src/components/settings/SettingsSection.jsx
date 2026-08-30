import { COLORS } from '../../lib/constants';

export default function SettingsSection({ title, children }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 16, marginBottom: 14 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}
