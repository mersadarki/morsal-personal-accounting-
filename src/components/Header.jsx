import { BookOpen } from 'lucide-react';
import { COLORS } from '../lib/constants';
import { displayStyle } from '../lib/ui.jsx';

export default function Header() {
  return (
    <div style={{ background: COLORS.cover, borderBottom: `4px solid ${COLORS.brass}`, position: 'sticky', top: 0, zIndex: 20 }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '14px 16px', paddingTop: 'max(14px, env(safe-area-inset-top))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: COLORS.brass, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BookOpen size={20} color={COLORS.cover} />
          </div>
          <div style={{ ...displayStyle, fontSize: 22, color: COLORS.paper }}>دفتر حساب</div>
        </div>
      </div>
    </div>
  );
}
