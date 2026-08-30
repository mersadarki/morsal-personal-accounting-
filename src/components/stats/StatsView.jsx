import { lazy, Suspense } from 'react';
import { COLORS } from '../../lib/constants';
import { toFaDigits } from '../../lib/format';
import { FieldLabel, selectStyle, subTabStyle } from '../../lib/ui.jsx';
import StatsGrid from './StatsGrid';
import NedaBreakdown from './NedaBreakdown';

const DailyChart = lazy(() => import('./DailyChart'));

function ChartFallback() {
  return <div style={{ height: 180, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.inkLight, fontSize: 12 }}>در حال بارگذاری نمودار...</div>;
}

export default function StatsView({
  statsTab, setStatsTab, statsYear, setStatsYear, yearOptions,
  statsMonth, setStatsMonth, monthOptions, statsTotal, statsYearly, statsMonthly,
  dailyChartData, nedaBreakdown, nedaGrandTotal, nedaChartData,
}) {
  const statsShown = statsTab === 'total' ? statsTotal : statsTab === 'yearly' ? statsYearly : statsTab === 'monthly' ? statsMonthly : null;

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, background: '#fff', border: `1px solid ${COLORS.line}`, padding: 4, borderRadius: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <button onClick={() => setStatsTab('total')} style={{ ...subTabStyle(statsTab === 'total'), flex: 1 }}>کل</button>
        <button onClick={() => setStatsTab('yearly')} style={{ ...subTabStyle(statsTab === 'yearly'), flex: 1 }}>سالانه</button>
        <button onClick={() => setStatsTab('monthly')} style={{ ...subTabStyle(statsTab === 'monthly'), flex: 1 }}>ماهانه</button>
        <button onClick={() => setStatsTab('neda')} style={{ ...subTabStyle(statsTab === 'neda'), flex: 1 }}>ندا</button>
      </div>

      {statsTab === 'yearly' && (
        <div style={{ marginBottom: 12 }}>
          <FieldLabel>سال</FieldLabel>
          <select value={statsYear} onChange={(e) => setStatsYear(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
            {yearOptions.map((y) => <option key={y} value={y}>{toFaDigits(y)}</option>)}
          </select>
        </div>
      )}
      {statsTab === 'monthly' && (
        <div style={{ marginBottom: 12 }}>
          <FieldLabel>ماه</FieldLabel>
          <select value={statsMonth} onChange={(e) => setStatsMonth(e.target.value)} style={{ ...selectStyle, width: '100%' }}>
            {monthOptions.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      )}

      {statsTab === 'monthly' && (
        <Suspense fallback={<ChartFallback />}>
          <DailyChart data={dailyChartData} />
        </Suspense>
      )}

      {(statsTab === 'total' || statsTab === 'yearly' || statsTab === 'monthly') && statsShown && (
        <StatsGrid stats={statsShown} />
      )}

      {statsTab === 'neda' && (
        <NedaBreakdown nedaBreakdown={nedaBreakdown} nedaGrandTotal={nedaGrandTotal} nedaChartData={nedaChartData} />
      )}
    </div>
  );
}
