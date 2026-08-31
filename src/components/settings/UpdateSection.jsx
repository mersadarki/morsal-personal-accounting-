import { RefreshCw, Download } from 'lucide-react';
import { COLORS } from '../../lib/constants';
import { primaryBtn, secondaryBtn } from '../../lib/ui.jsx';
import SettingsSection from './SettingsSection';

function formatDateTime(iso) {
  if (!iso) return 'هنوز انجام نشده';
  try {
    return new Date(iso).toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default function UpdateSection({ needRefresh, checking, lastCheck, lastApplied, buildTime, onCheck, onApply }) {
  return (
    <SettingsSection title="به‌روزرسانی">
      {needRefresh ? (
        <div style={{ background: COLORS.expenseBg, border: `1px solid ${COLORS.expense}`, borderRadius: 10, padding: 10, marginBottom: 10, fontSize: 12.5, color: COLORS.expense, fontWeight: 700 }}>
          نسخه‌ی جدیدی آماده‌ست — برای نصب دکمه‌ی زیر رو بزنید (اپ یک بار رفرش می‌شه).
        </div>
      ) : null}
      <div style={{ fontSize: 11.5, color: COLORS.inkLight, marginBottom: 10, lineHeight: 2 }}>
        نسخه‌ی نصب‌شده مربوط به: {formatDateTime(buildTime)}
        <br />
        آخرین بررسی برای آپدیت: {formatDateTime(lastCheck)}
        <br />
        آخرین آپدیت اعمال‌شده: {formatDateTime(lastApplied)}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={onCheck} disabled={checking} style={{ ...secondaryBtn, opacity: checking ? 0.6 : 1 }}>
          <RefreshCw size={15} /> {checking ? 'در حال بررسی...' : 'بررسی برای آپدیت جدید'}
        </button>
        {needRefresh ? (
          <button onClick={onApply} style={primaryBtn}><Download size={15} /> نصب و بارگذاری مجدد</button>
        ) : null}
      </div>
    </SettingsSection>
  );
}
