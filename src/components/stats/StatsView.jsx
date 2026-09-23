import { lazy, Suspense } from 'react';
import { COLORS } from '../../lib/constants';
import { toFaDigits } from '../../lib/format';
import { FieldLabel, selectStyle, subTabStyle, Amount } from '../../lib/ui.jsx';
import StatsGrid from './StatsGrid';
import NedaBreakdown from './NedaBreakdown';
import TransactionList from '../home/TransactionList';

const DailyChart = lazy(() => import('./DailyChart'));

function ChartFallback() {
  return <div style={{ height: 180, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.inkLight, fontSize: 12 }}>در حال بارگذاری نمودار...</div>;
}

export default function StatsView({
  statsTab, setStatsTab, statsYear, setStatsYear, yearOptions,
  statsMonth, setStatsMonth, monthOptions, statsTotal, statsYearly, statsMonthly,
  dailyChartData, dailyIncomeChartData, nedaBreakdown, nedaGrandTotal,
  statsMonthExpenseTx, statsMonthIncomeTx, vpnNewIncomeTx, vpnNewCostTx,
  statsVisibleExpense, setStatsVisibleExpense, statsVisibleIncome, setStatsVisibleIncome,
  saving, confirmDeleteId, setConfirmDeleteId, onEdit, onDelete, runningBalanceByTxId,
}) {
  const statsShown = statsTab === 'total' ? statsTotal : statsTab === 'yearly' ? statsYearly : statsTab === 'monthly' ? statsMonthly : null;
  const vpnNewGross = vpnNewIncomeTx.reduce((s, r) => s + (r.a || 0), 0);
  const vpnNewCost = vpnNewCostTx.reduce((s, r) => s + (r.a || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, background: '#fff', border: `1px solid ${COLORS.line}`, padding: 4, borderRadius: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <button onClick={() => setStatsTab('total')} style={{ ...subTabStyle(statsTab === 'total'), flex: 1 }}>کل</button>
        <button onClick={() => setStatsTab('yearly')} style={{ ...subTabStyle(statsTab === 'yearly'), flex: 1 }}>سالانه</button>
        <button onClick={() => setStatsTab('monthly')} style={{ ...subTabStyle(statsTab === 'monthly'), flex: 1 }}>ماهانه</button>
        <button onClick={() => setStatsTab('neda')} style={{ ...subTabStyle(statsTab === 'neda'), flex: 1 }}>ندا</button>
        <button onClick={() => setStatsTab('vpnNew')} style={{ ...subTabStyle(statsTab === 'vpnNew'), flex: 1 }}>وی‌پی‌ان نیو</button>
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
          <DailyChart data={dailyChartData} title="پراکندگی هزینه‌ها در روزهای ماه" color={COLORS.expense} />
          <DailyChart data={dailyIncomeChartData} title="پراکندگی درآمد در روزهای ماه" color={COLORS.income} />
        </Suspense>
      )}

      {(statsTab === 'total' || statsTab === 'yearly' || statsTab === 'monthly') && statsShown && (
        <StatsGrid stats={statsShown} />
      )}

      {statsTab === 'monthly' && (
        <div style={{ marginTop: 16 }}>
          <TransactionList
            type="e" monthLabel={statsMonth} rows={statsMonthExpenseTx} visibleCount={statsVisibleExpense}
            onShowMore={() => setStatsVisibleExpense((c) => c + 40)} saving={saving}
            confirmDeleteId={confirmDeleteId} setConfirmDeleteId={setConfirmDeleteId}
            onEdit={onEdit} onDelete={onDelete} runningBalanceByTxId={runningBalanceByTxId}
          />
          <div style={{ marginTop: 16 }}>
            <TransactionList
              type="i" monthLabel={statsMonth} rows={statsMonthIncomeTx} visibleCount={statsVisibleIncome}
              onShowMore={() => setStatsVisibleIncome((c) => c + 40)} saving={saving}
              confirmDeleteId={confirmDeleteId} setConfirmDeleteId={setConfirmDeleteId}
              onEdit={onEdit} onDelete={onDelete} runningBalanceByTxId={runningBalanceByTxId}
            />
          </div>
        </div>
      )}

      {statsTab === 'neda' && (
        <NedaBreakdown nedaBreakdown={nedaBreakdown} nedaGrandTotal={nedaGrandTotal} />
      )}

      {statsTab === 'vpnNew' && (
        <div>
          {/* هر ردیفی که تو سود «وی‌پی‌ان نیو» حساب می‌شه — همه‌شون با هم، نه
              فقط یه ماه — تا یه دسته‌بندی اشتباه یا یه عنوان تایپی، یا حتی
              یه صفر اضافه تو مبلغ، تو خود لیست دیده بشه، نه فقط تو جمعش. */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 11.5, color: COLORS.inkLight, marginBottom: 4 }}>درآمد (دسته «وی‌پی‌ان نیو»)</div>
              <div className="tabular" style={{ fontSize: 15, fontWeight: 800, color: COLORS.income }}><Amount value={vpnNewGross} /></div>
            </div>
            <div style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 11.5, color: COLORS.inkLight, marginBottom: 4 }}>هزینه (عنوان «vpn new»)</div>
              <div className="tabular" style={{ fontSize: 15, fontWeight: 800, color: COLORS.expense }}><Amount value={vpnNewCost} /></div>
            </div>
          </div>
          <TransactionList
            type="i" monthLabel="همه" rows={vpnNewIncomeTx} visibleCount={Infinity} onShowMore={() => {}} saving={saving}
            confirmDeleteId={confirmDeleteId} setConfirmDeleteId={setConfirmDeleteId} onEdit={onEdit} onDelete={onDelete}
          />
          <div style={{ marginTop: 16 }}>
            <TransactionList
              type="e" monthLabel="همه" rows={vpnNewCostTx} visibleCount={Infinity} onShowMore={() => {}} saving={saving}
              confirmDeleteId={confirmDeleteId} setConfirmDeleteId={setConfirmDeleteId} onEdit={onEdit} onDelete={onDelete}
            />
          </div>
        </div>
      )}
    </div>
  );
}
