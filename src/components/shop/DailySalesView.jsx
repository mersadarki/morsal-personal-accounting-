import { useMemo, useState } from 'react';
import { COLORS } from '../../lib/constants';
import { jalaliToISO, todayJalali } from '../../lib/jalali';
import { computeSalesTotals, isoDaysAgo, isoToday } from '../../lib/shopStats';
import StatCard from '../stats/StatCard';
import SaleForm from './SaleForm';
import SalesList from './SalesList';

export default function DailySalesView({ products, sales, onAddSale, onDeleteSale }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const today = todayJalali();

  const todaySales = useMemo(
    () => sales.filter((r) => r.jy === today.jy && r.jm === today.jm && r.jd === today.jd).sort((a, b) => b.id - a.id),
    [sales, today.jy, today.jm, today.jd],
  );
  const weekSales = useMemo(() => {
    const from = isoDaysAgo(6), to = isoToday();
    return sales.filter((r) => { const iso = jalaliToISO(r.jy, r.jm, r.jd); return iso >= from && iso <= to; });
  }, [sales]);

  const todayTotals = useMemo(() => computeSalesTotals(todaySales), [todaySales]);
  const weekTotals = useMemo(() => computeSalesTotals(weekSales), [weekSales]);

  return (
    <div>
      <SaleForm products={products} onAddSale={onAddSale} />

      <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.inkLight, marginBottom: 8 }}>امروز</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
        <StatCard label="فروش امروز" value={todayTotals.totalSale} color={COLORS.ink} />
        <StatCard label="سود امروز" value={todayTotals.totalProfit} color={todayTotals.totalProfit >= 0 ? COLORS.income : COLORS.expense} />
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.inkLight, marginBottom: 8 }}>هفته اخیر (۷ روز)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
        <StatCard label="فروش هفته" value={weekTotals.totalSale} color={COLORS.ink} />
        <StatCard label="سود هفته" value={weekTotals.totalProfit} color={weekTotals.totalProfit >= 0 ? COLORS.income : COLORS.expense} />
      </div>

      <SalesList
        title="فروش‌های امروز" rows={todaySales} confirmDeleteId={confirmDeleteId}
        setConfirmDeleteId={setConfirmDeleteId} onDelete={onDeleteSale} emptyText="امروز هنوز فروشی ثبت نشده."
      />
    </div>
  );
}
