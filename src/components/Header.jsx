import { BookOpen, Settings as SettingsIcon } from 'lucide-react';
import { COLORS } from '../lib/constants';
import { tabStyle, displayStyle } from '../lib/ui.jsx';

export default function Header({ view, setView }) {
  return (
    <div style={{ background: COLORS.cover, borderBottom: `4px solid ${COLORS.brass}`, position: 'sticky', top: 0, zIndex: 20 }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: COLORS.brass, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BookOpen size={20} color={COLORS.cover} />
          </div>
          <div style={{ ...displayStyle, fontSize: 22, color: COLORS.paper }}>دفتر حساب</div>
        </div>
        <div style={{ display: 'flex', gap: 6, background: COLORS.coverLight, padding: 4, borderRadius: 10 }}>
          <button onClick={() => setView('home')} style={{ ...tabStyle(view === 'home'), flex: 1 }}>خانه</button>
          <button onClick={() => setView('stats')} style={{ ...tabStyle(view === 'stats'), flex: 1 }}>آمار</button>
          <button onClick={() => setView('settings')} style={{ ...tabStyle(view === 'settings'), flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <SettingsIcon size={13} /> تنظیمات
          </button>
        </div>
      </div>
    </div>
  );
}
