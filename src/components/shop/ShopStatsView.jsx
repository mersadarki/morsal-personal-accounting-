import { useMemo, useState } from 'react';
import { Check, Trash2, X } from 'lucide-react';
import { COLORS, MONTHS, SHOP_CATEGORY_LABELS } from '../../lib/constants';
import { toFaDigits } from '../../lib/format';
import { jalaliToISO, toJalaali, todayJalali } from '../../lib/jalali';
import { addArchiveTotals, computeSalesTotals, isoDaysAgo } from '../../lib/shopStats';
import { Amount, FieldLabel, iconBtn, selectStyle, subTabStyle } from '../../lib/ui.jsx';
import StatCard from '../stats/StatCard';
import ArchiveForm from './ArchiveForm';
import JalaliDateFields from './JalaliDateFields';
import SalesList from './SalesList';

function TotalsGrid({ totals }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
      <StatCard label="کل فروش" value={totals.totalSale} color={COLORS.ink} />
      <StatCard label="کل سود" value={totals.totalProfit} color={totals.totalProfit >= 0 ? COLORS.income : COLORS.expense} />
      <StatCard label={`فروش ${SHOP_CATEGORY_LABELS.phone}`} value={totals.phone.sale} color={COLORS.income} />
      <StatCard label={`سود ${SHOP_CATEGORY_LABELS.phone}`} value={totals.phone.profit} color={COLORS.income} />
      <StatCard label={`فروش ${SHOP_CATEGORY_LABELS.accessory}`} value={totals.accessory.sale} color={COLORS.brassDark} />
      <StatCard label={`سود ${SHOP_CATEGORY_LABELS.accessory}`} value={totals.accessory.profit} color={COLORS.brassDark} />
    </div>
  );
}

export default function ShopStatsView({ sales, archives, onAddArchive, onDeleteArchive, onDeleteSale }) {
  const today = todayJalali();
  const [tab, setTab] = useState('monthly');
  const [day, setDay] = useState(() => ({ ...today }));
  const [year, setYear] = useState(today.jy);
  const [month, setMonth] = useState(today.jm);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmDeleteArchiveId, setConfirmDeleteArchiveId] = useState(null);

  const yearOptions = useMemo(() => {
    const set = new Set([today.jy]);
    sales.forEach((r) => { if (r.jy) set.add(r.jy); });
    archives.forEach((a) => { if (a.year) set.add(a.year); });
    return Array.from(set).sort((a, b) => b - a);
  }, [sales, archives, today.jy]);

  const daySales = useMemo(
    () => sales.filter((r) => r.jy === day.jy && r.jm === day.jm && r.jd === day.jd).sort((a, b) => b.id - a.id),
    [sales, day],
  );
  const dayTotals = useMemo(() => computeSalesTotals(daySales), [daySales]);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const j = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
    const iso = d.toISOString().slice(0, 10);
    const rows = sales.filter((r) => jalaliToISO(r.jy, r.jm, r.jd) === iso);
    return { iso, jm: j.jm, jd: j.jd, totals: computeSalesTotals(rows) };
  }), [sales]);
  const weekRows = useMemo(() => {
    const from = isoDaysAgo(6);
    return sales.filter((r) => jalaliToISO(r.jy, r.jm, r.jd) >= from);
  }, [sales]);
  const weekTotals = useMemo(() => computeSalesTotals(weekRows), [weekRows]);

  const monthRows = useMemo(() => sales.filter((r) => r.jy === year && r.jm === month), [sales, year, month]);
  const monthSaleTotals = useMemo(() => computeSalesTotals(monthRows), [monthRows]);
  const monthTotals = useMemo(() => addArchiveTotals(monthSaleTotals, archives, year, month), [monthSaleTotals, archives, year, month]);

  const yearRows = useMemo(() => sales.filter((r) => r.jy === year), [sales, year]);
  const yearSaleTotals = useMemo(() => computeSalesTotals(yearRows), [yearRows]);
  const yearTotals = useMemo(() => addArchiveTotals(yearSaleTotals, archives, year, null), [yearSaleTotals, archives, year]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, background: '#fff', border: `1px solid ${COLORS.line}`, padding: 4, borderRadius: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <button onClick={() => setTab('daily')} style={{ ...subTabStyle(tab === 'daily'), flex: 1 }}>روزانه</button>
        <button onClick={() => setTab('weekly')} style={{ ...subTabStyle(tab === 'weekly'), flex: 1 }}>هفتگی</button>
        <button onClick={() => setTab('monthly')} style={{ ...subTabStyle(tab === 'monthly'), flex: 1 }}>ماهانه</button>
        <button onClick={() => setTab('yearly')} style={{ ...subTabStyle(tab === 'yearly'), flex: 1 }}>سالانه</button>
        <button onClick={() => setTab('archive')} style={{ ...subTabStyle(tab === 'archive'), flex: 1 }}>سال‌های قبل</button>
      </div>

      {tab === 'daily' && (
        <>
          <div style={{ marginBottom: 12 }}>
            <JalaliDateFields value={day} onChange={setDay} />
          </div>
          <TotalsGrid totals={dayTotals} />
          <SalesList
            title="فروش‌های این روز" rows={daySales} confirmDeleteId={confirmDeleteId}
            setConfirmDeleteId={setConfirmDeleteId} onDelete={onDeleteSale} emptyText="فروشی برای این روز ثبت نشده."
          />
        </>
      )}

      {tab === 'weekly' && (
        <>
          <TotalsGrid totals={weekTotals} />
          <div style={{ fontSize: 12, color: COLORS.inkLight, marginBottom: 8 }}>پراکندگی ۷ روز اخیر</div>
          <div style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12, overflow: 'hidden' }}>
            {weekDays.map((w) => (
              <div key={w.iso} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderBottom: `1px solid ${COLORS.line}` }}>
                <div style={{ flex: 1, fontSize: 12.5 }}>{MONTHS[w.jm - 1]} {toFaDigits(w.jd)}</div>
                <div className="tabular" style={{ fontSize: 12.5, fontWeight: 700 }}><Amount value={w.totals.totalSale} /></div>
                <div className="tabular" style={{ fontSize: 11, color: w.totals.totalProfit >= 0 ? COLORS.income : COLORS.expense, minWidth: 70, textAlign: 'left' }}>
                  <Amount value={w.totals.totalProfit} sign={w.totals.totalProfit >= 0 ? '+' : ''} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'monthly' && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <FieldLabel>سال</FieldLabel>
              <select value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))} style={{ ...selectStyle, width: '100%' }}>
                {yearOptions.map((y) => <option key={y} value={y}>{toFaDigits(y)}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <FieldLabel>ماه</FieldLabel>
              <select value={month} onChange={(e) => setMonth(parseInt(e.target.value, 10))} style={{ ...selectStyle, width: '100%' }}>
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>
          </div>
          <TotalsGrid totals={monthTotals} />
          <SalesList
            title="فروش‌های ثبت‌شده‌ی این ماه" rows={monthRows.slice().sort((a, b) => b.id - a.id)}
            confirmDeleteId={confirmDeleteId} setConfirmDeleteId={setConfirmDeleteId} onDelete={onDeleteSale}
            emptyText="فروش ثبت‌شده‌ای برای این ماه نیست — اگه از سال‌های قبله، از تب «سال‌های قبل» اضافه کن."
          />
        </>
      )}

      {tab === 'yearly' && (
        <>
          <div style={{ marginBottom: 12, maxWidth: 200 }}>
            <FieldLabel>سال</FieldLabel>
            <select value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))} style={{ ...selectStyle, width: '100%' }}>
              {yearOptions.map((y) => <option key={y} value={y}>{toFaDigits(y)}</option>)}
            </select>
          </div>
          <TotalsGrid totals={yearTotals} />
          <div style={{ fontSize: 11, color: COLORS.inkLight, lineHeight: 2 }}>
            شامل فروش‌های ثبت‌شده‌ی این اپ + هر ردیف آمار سال قبلی که برای همین سال از تب «سال‌های قبل» اضافه کردی.
          </div>
        </>
      )}

      {tab === 'archive' && (
        <>
          <ArchiveForm onAdd={onAddArchive} />
          <div style={{ fontSize: 12, color: COLORS.inkLight, marginBottom: 8 }}>ردیف‌های ثبت‌شده ({toFaDigits(archives.length)})</div>
          <div style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12, overflow: 'hidden' }}>
            {archives.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: COLORS.inkLight, fontSize: 13 }}>هنوز آماری از سال‌های قبل اضافه نشده.</div>}
            {archives.slice().sort((a, b) => (b.year - a.year) || ((b.month || 0) - (a.month || 0))).map((a) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderBottom: `1px solid ${COLORS.line}` }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {toFaDigits(a.year)} {a.month ? `· ${MONTHS[a.month - 1]}` : '· کل سال'}{a.category ? ` · ${SHOP_CATEGORY_LABELS[a.category]}` : ''}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.inkLight, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.note}</div>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div className="tabular" style={{ fontWeight: 700, fontSize: 13 }}><Amount value={a.totalSales} /></div>
                  <div className="tabular" style={{ fontSize: 10.5, color: a.totalProfit >= 0 ? COLORS.income : COLORS.expense }}>
                    سود: <Amount value={a.totalProfit} sign={a.totalProfit >= 0 ? '+' : ''} />
                  </div>
                </div>
                {confirmDeleteArchiveId === a.id ? (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => { onDeleteArchive(a.id); setConfirmDeleteArchiveId(null); }} style={iconBtn(COLORS.expense)}><Check size={13} /></button>
                    <button onClick={() => setConfirmDeleteArchiveId(null)} style={iconBtn(COLORS.inkLight)}><X size={13} /></button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDeleteArchiveId(a.id)} style={iconBtn(COLORS.expense)}><Trash2 size={13} /></button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
