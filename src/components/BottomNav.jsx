import { Settings as SettingsIcon } from 'lucide-react';
import { COLORS } from '../lib/constants';
import { tabStyle } from '../lib/ui.jsx';

export default function BottomNav({ view, setView }) {
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: COLORS.cover, borderTop: `4px solid ${COLORS.brass}`, zIndex: 20 }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '6px 16px', paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}>
        <div style={{ display: 'flex', gap: 4, background: COLORS.coverLight, padding: 4, borderRadius: 10 }}>
          <button onClick={() => setView('home')} style={{ ...tabStyle(view === 'home'), flex: 1, padding: '7px 4px', fontSize: 12 }}>خانه</button>
          <button onClick={() => setView('stats')} style={{ ...tabStyle(view === 'stats'), flex: 1, padding: '7px 4px', fontSize: 12 }}>آمار</button>
          <button onClick={() => setView('debts')} style={{ ...tabStyle(view === 'debts'), flex: 1, padding: '7px 4px', fontSize: 12 }}>بدهی</button>
          <button onClick={() => setView('installments')} style={{ ...tabStyle(view === 'installments'), flex: 1, padding: '7px 4px', fontSize: 12 }}>قسط</button>
          <button onClick={() => setView('settings')} style={{ ...tabStyle(view === 'settings'), flex: 1, padding: '7px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, fontSize: 12 }}>
            <SettingsIcon size={12} /> تنظیمات
          </button>
        </div>
      </div>
    </div>
  );
}
