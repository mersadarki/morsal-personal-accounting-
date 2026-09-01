import { COLORS } from '../../lib/constants';
import StatCard from './StatCard';

export default function StatsGrid({ stats }) {
  if (!stats) return null;
  return (
    <>
      <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.expense, marginBottom: 8 }}>هزینه‌ها</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
        <StatCard label="کل هزینه" value={stats.totalExpense} color={COLORS.expense} />
        <StatCard label="هزینه ندا" value={stats.nedaExpense} color={COLORS.expense} />
        <StatCard label="کل هزینه خودم" value={stats.selfExpenseTotal} color={COLORS.expense} />
        <StatCard label="مجموع اقساط" value={stats.installments} color={COLORS.expense} />
        <StatCard label="هزینه شخصی" value={stats.personalExpense} color={COLORS.expense} />
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.income, marginBottom: 8 }}>درآمدها</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        <StatCard label="درآمد کاپیتان" value={stats.kapitan} color={COLORS.income} />
        <StatCard label="درآمد وی‌پی‌ان (خالص)" value={stats.vpnNet} color={COLORS.income} />
        <StatCard label="درآمد خدمات" value={stats.khadamat} color={COLORS.income} />
        <StatCard label="مجموع درآمد" value={stats.incomeTotal} color={COLORS.income} />
      </div>

      <div style={{ fontSize: 11, color: COLORS.inkLight, marginTop: 14, lineHeight: 2 }}>
        همه مبالغ به هزار تومان. «جابجایی» در هزینه‌ها و دسته «جابجایی» در درآمدها حساب نمی‌شن.
      </div>
    </>
  );
}
