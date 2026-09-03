import { Home, BarChart3, HandCoins, Repeat, Settings as SettingsIcon } from 'lucide-react';
import { COLORS } from '../lib/constants';

const TABS = [
  { key: 'home', label: 'خانه', Icon: Home },
  { key: 'stats', label: 'آمار', Icon: BarChart3 },
  { key: 'debts', label: 'بدهی', Icon: HandCoins },
  { key: 'installments', label: 'قسط', Icon: Repeat },
  { key: 'settings', label: 'تنظیمات', Icon: SettingsIcon },
];

export default function BottomNav({ view, setView }) {
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: COLORS.cover, borderTop: `3px solid ${COLORS.brass}`, zIndex: 20, boxShadow: '0 -3px 14px rgba(0,0,0,0.18)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', padding: '6px 6px', paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}>
        {TABS.map(({ key, label, Icon }) => {
          const active = view === key;
          return (
            <button
              key={key}
              onClick={() => setView(key)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 3, padding: '7px 2px', margin: '0 2px', border: 'none', borderRadius: 12, cursor: 'pointer',
                background: active ? COLORS.brass : 'transparent',
                color: active ? COLORS.cover : 'rgba(243,238,223,0.65)',
                fontFamily: 'Vazirmatn', transition: 'background 0.15s ease, color 0.15s ease',
              }}
            >
              <Icon size={19} strokeWidth={active ? 2.4 : 2} />
              <span style={{ fontSize: 10.5, fontWeight: active ? 700 : 600 }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
