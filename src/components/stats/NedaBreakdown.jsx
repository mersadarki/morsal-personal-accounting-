import { lazy, Suspense } from 'react';
import { ACCOUNT_LABELS, COLORS } from '../../lib/constants';
import { fmt, toFaDigits } from '../../lib/format';
import { displayStyle } from '../../lib/ui.jsx';

const NedaChart = lazy(() => import('./NedaChart'));

export default function NedaBreakdown({ nedaBreakdown, nedaGrandTotal, nedaChartData }) {
  return (
    <div>
      <div style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 14, marginBottom: 14, textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: COLORS.inkLight, marginBottom: 4 }}>مجموع کل هزینه‌های ندا (هزار تومان)</div>
        <div className="tabular" style={{ fontSize: 22, fontWeight: 800, color: COLORS.expense }}>{fmt(nedaGrandTotal)}</div>
      </div>
      {nedaChartData.length > 0 && (
        <Suspense fallback={<div style={{ height: 180, marginBottom: 14 }} />}>
          <NedaChart data={nedaChartData} />
        </Suspense>
      )}
      {nedaBreakdown.length === 0 && (
        <div style={{ padding: 30, textAlign: 'center', color: COLORS.inkLight, fontSize: 13, background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12 }}>هزینه‌ای برای ندا ثبت نشده.</div>
      )}
      {nedaBreakdown.map((y) => (
        <div key={y.year} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 4px', marginBottom: 6 }}>
            <div style={{ ...displayStyle, fontSize: 17, color: COLORS.cover }}>سال {y.year}</div>
            <div className="tabular" style={{ fontSize: 13, fontWeight: 700, color: COLORS.expense }}>{fmt(y.yearTotal)}</div>
          </div>
          {y.months.map((mo) => (
            <div key={mo.month} style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12, marginBottom: 8, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: COLORS.paperDark }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{mo.month}</div>
                <div className="tabular" style={{ fontSize: 13, fontWeight: 700, color: COLORS.expense }}>{fmt(mo.total)}</div>
              </div>
              {mo.rows.map((r) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderTop: `1px solid ${COLORS.line}` }}>
                  <div style={{ flex: 1, fontSize: 12.5 }}>{r.ti || 'بدون عنوان'}</div>
                  <div style={{ fontSize: 11, color: COLORS.inkLight }}>{ACCOUNT_LABELS[r.acc] || r.acc}{r.dt ? ` · روز ${toFaDigits(r.dt)}` : ''}</div>
                  <div className="tabular" style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.expense }}>{fmt(r.a)}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
