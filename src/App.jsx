import { useState, useEffect, useMemo, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { COLORS } from './lib/constants';
import { toEnglishDigits, monthInfo, uid, isTransferExpenseTitle, toFaDigits } from './lib/format';
import { todayDay } from './lib/jalali';
import { TX_KEY, BAL_KEY, MONTH_KEY, storageGet, storageSet } from './lib/storage';
import { computeStatsRows } from './lib/stats';
import { SEED_TX, SEED_BALANCES } from './lib/seed';
import { downloadBackup, exportExcel, readSheet, parseNedaRows, parseGeneralRows } from './lib/io';
import { fontStyle } from './lib/ui.jsx';

import Header from './components/Header';
import CurrentMonthBar from './components/CurrentMonthBar';
import HomeView from './components/home/HomeView';
import StatsView from './components/stats/StatsView';
import SettingsView from './components/settings/SettingsView';
import BalanceFormModal from './components/settings/BalanceFormModal';

const emptyBalForm = { month: '', 'ملی': '', 'ویپاد': '', 'اعتبار ملی': '', 'نقدی': '', 'دلار': '' };
function emptyForm() { return { t: 'e', acc: 'ملی', a: '', ti: '', neda: false, cat: 'vpn', personalVpn: false, dt: String(todayDay()) }; }
const DEFAULT_MONTH = 'شهریور ۱۴۰۵';

export default function App() {
  const [tx, setTx] = useState([]);
  const [balances, setBalances] = useState({});
  const [currentMonth, setCurrentMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('home');
  const [statsTab, setStatsTab] = useState('total');
  const [statsYear, setStatsYear] = useState('');
  const [form, setForm] = useState(emptyForm());
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [statsMonth, setStatsMonth] = useState('');
  const [balForm, setBalForm] = useState(emptyBalForm);
  const [balError, setBalError] = useState('');
  const [editingBalMonth, setEditingBalMonth] = useState(null);
  const [showBalForm, setShowBalForm] = useState(false);
  const [confirmDeleteBal, setConfirmDeleteBal] = useState(null);
  const [visibleCount, setVisibleCount] = useState(40);
  const [importMsg1, setImportMsg1] = useState('');
  const [importMsg2, setImportMsg2] = useState('');
  const [backupMsg, setBackupMsg] = useState('');
  const nedaFileRef = useRef(null);
  const genFileRef = useRef(null);
  const backupFileRef = useRef(null);

  useEffect(() => { load(); }, []);

  function load() {
    setLoading(true);
    try {
      const raw = storageGet(TX_KEY);
      if (raw) setTx(JSON.parse(raw));
      else { const seeded = SEED_TX.map((r, i) => ({ ...r, id: i + 1 })); setTx(seeded); storageSet(TX_KEY, JSON.stringify(seeded)); }
    } catch { setTx(SEED_TX.map((r, i) => ({ ...r, id: i + 1 }))); }
    try {
      const rawB = storageGet(BAL_KEY);
      if (rawB) setBalances(JSON.parse(rawB));
      else { setBalances(SEED_BALANCES); storageSet(BAL_KEY, JSON.stringify(SEED_BALANCES)); }
    } catch { setBalances(SEED_BALANCES); }
    try {
      const rawM = storageGet(MONTH_KEY);
      if (rawM) setCurrentMonth(rawM);
      else { setCurrentMonth(DEFAULT_MONTH); storageSet(MONTH_KEY, DEFAULT_MONTH); }
    } catch { setCurrentMonth(DEFAULT_MONTH); }
    setLoading(false);
  }

  function persistTx(next) { setTx(next); setSaving(true); storageSet(TX_KEY, JSON.stringify(next)); setSaving(false); }
  function persistBalances(next) { setBalances(next); setSaving(true); storageSet(BAL_KEY, JSON.stringify(next)); setSaving(false); }
  function persistMonth(m) { setCurrentMonth(m); storageSet(MONTH_KEY, m); }

  const monthOptions = useMemo(() => {
    const map = new Map();
    tx.forEach((r) => { if (!map.has(r.m)) map.set(r.m, monthInfo(r.m).sortKey); });
    Object.keys(balances).forEach((m) => { if (!map.has(m)) map.set(m, monthInfo(m).sortKey); });
    if (currentMonth && !map.has(currentMonth)) map.set(currentMonth, monthInfo(currentMonth).sortKey);
    return Array.from(map.entries()).sort((a, b) => (a[1] < b[1] ? 1 : -1)).map(([m]) => m);
  }, [tx, balances, currentMonth]);

  const yearOptions = useMemo(() => {
    const set = new Set();
    tx.forEach((r) => { const y = monthInfo(r.m).year; if (y) set.add(y); });
    return Array.from(set).sort((a, b) => (a < b ? 1 : -1));
  }, [tx]);

  const titleSuggestions = useMemo(() => {
    const set = new Set();
    tx.forEach((r) => { if (r.t === 'e' && r.ti) set.add(r.ti); });
    return Array.from(set).slice(0, 200);
  }, [tx]);

  useEffect(() => { if (!statsMonth && currentMonth) setStatsMonth(currentMonth); }, [currentMonth]);
  useEffect(() => { if (!statsYear && yearOptions.length) setStatsYear(yearOptions[0]); }, [yearOptions]);

  const currentMonthTx = useMemo(() => tx.filter((r) => r.m === currentMonth).sort((a, b) => b.id - a.id), [tx, currentMonth]);
  const listTx = useMemo(() => currentMonthTx.filter((r) => r.t === form.t), [currentMonthTx, form.t]);

  const latestBalances = useMemo(() => {
    const entries = Object.entries(balances);
    if (entries.length === 0) return null;
    entries.sort((a, b) => (monthInfo(a[0]).sortKey < monthInfo(b[0]).sortKey ? 1 : -1));
    return { month: entries[0][0], vals: entries[0][1] };
  }, [balances]);

  const statsTotal = useMemo(() => computeStatsRows(tx), [tx]);
  const statsYearly = useMemo(() => computeStatsRows(tx.filter((r) => monthInfo(r.m).year === statsYear)), [tx, statsYear]);
  const statsMonthly = useMemo(() => computeStatsRows(tx.filter((r) => r.m === statsMonth)), [tx, statsMonth]);

  const dailyChartData = useMemo(() => {
    const days = Array.from({ length: 31 }, (_, i) => ({ day: toFaDigits(i + 1), amount: 0 }));
    tx.filter((r) => r.m === statsMonth && r.t === 'e' && !isTransferExpenseTitle(r.ti) && r.dt).forEach((r) => {
      const idx = r.dt - 1;
      if (idx >= 0 && idx < 31) days[idx].amount += r.a || 0;
    });
    return days;
  }, [tx, statsMonth]);

  const nedaBreakdown = useMemo(() => {
    const nedaRows = tx.filter((r) => r.t === 'e' && r.neda);
    const byYear = new Map();
    nedaRows.forEach((r) => {
      const info = monthInfo(r.m);
      const year = info.year || '—';
      if (!byYear.has(year)) byYear.set(year, new Map());
      const byMonth = byYear.get(year);
      if (!byMonth.has(r.m)) byMonth.set(r.m, { sortKey: info.sortKey, rows: [] });
      byMonth.get(r.m).rows.push(r);
    });
    const years = Array.from(byYear.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
    return years.map(([year, byMonth]) => {
      const months = Array.from(byMonth.entries()).sort((a, b) => (a[1].sortKey < b[1].sortKey ? 1 : -1));
      const yearTotal = months.reduce((s, [, v]) => s + v.rows.reduce((s2, r) => s2 + (r.a || 0), 0), 0);
      return { year, yearTotal, months: months.map(([m, v]) => ({ month: m, sortKey: v.sortKey, total: v.rows.reduce((s, r) => s + (r.a || 0), 0), rows: v.rows.sort((a, b) => (a.dt || 0) - (b.dt || 0)) })) };
    });
  }, [tx]);
  const nedaGrandTotal = nedaBreakdown.reduce((s, y) => s + y.yearTotal, 0);
  const nedaChartData = useMemo(() => {
    const flat = [];
    [...nedaBreakdown].reverse().forEach((y) => y.months.forEach((m) => flat.push({ label: m.month, amount: m.total, sortKey: m.sortKey })));
    return flat.sort((a, b) => (a.sortKey < b.sortKey ? -1 : 1));
  }, [nedaBreakdown]);

  function openAdd() { setForm((f) => ({ ...emptyForm(), t: f.t })); setEditingId(null); setFormError(''); }
  function openEdit(r) {
    setForm({ t: r.t, acc: r.acc, a: String(r.a), ti: r.ti || '', neda: !!r.neda, cat: r.cat || 'vpn', personalVpn: !!r.personalVpn, dt: r.dt != null ? String(r.dt) : String(todayDay()) });
    setEditingId(r.id); setFormError('');
  }
  function submitForm(e) {
    e.preventDefault();
    const amt = parseFloat(toEnglishDigits(form.a));
    if (isNaN(amt) || amt <= 0) { setFormError('مبلغ را درست وارد کنید.'); return; }
    const dtVal = form.dt ? parseInt(toEnglishDigits(String(form.dt)), 10) : null;
    const base = { acc: form.acc, a: amt, m: currentMonth, dt: (dtVal && !isNaN(dtVal)) ? dtVal : null };

    if (form.t === 'i') {
      const rec = { ...base, t: 'i', ti: '', cat: form.cat, personalVpn: form.cat === 'vpn' ? form.personalVpn : false };
      if (editingId != null) {
        persistTx(tx.map((r) => (r.id === editingId ? { ...rec, id: editingId } : r)));
      } else {
        const matchIdx = tx.findIndex((r) => r.t === 'i' && r.m === currentMonth && r.dt === rec.dt && r.acc === rec.acc && r.cat === rec.cat && !!r.personalVpn === !!rec.personalVpn);
        if (matchIdx > -1) {
          const next = tx.map((r, i) => (i === matchIdx ? { ...r, a: (r.a || 0) + amt } : r));
          persistTx(next);
        } else {
          persistTx([...tx, { ...rec, id: uid(tx) }]);
        }
      }
    } else {
      const rec = { ...base, t: 'e', ti: form.ti.trim(), neda: form.neda };
      if (editingId != null) persistTx(tx.map((r) => (r.id === editingId ? { ...rec, id: editingId } : r)));
      else persistTx([...tx, { ...rec, id: uid(tx) }]);
    }
    setForm((f) => ({ ...emptyForm(), t: f.t }));
    setEditingId(null);
  }
  function handleDelete(id) { persistTx(tx.filter((r) => r.id !== id)); setConfirmDeleteId(null); }

  function openAddBalance() { setBalForm({ ...emptyBalForm, month: currentMonth }); setEditingBalMonth(null); setBalError(''); setShowBalForm(true); }
  function openEditBalance(month) {
    const b = balances[month] || {};
    const next = { month };
    Object.keys(emptyBalForm).forEach((a) => { if (a !== 'month') next[a] = b[a] != null ? String(b[a]) : ''; });
    setBalForm(next); setEditingBalMonth(month); setBalError(''); setShowBalForm(true);
  }
  function submitBalForm(e) {
    e.preventDefault();
    const month = balForm.month.trim();
    if (!month) { setBalError('ماه را مشخص کنید.'); return; }
    const entry = {};
    Object.keys(emptyBalForm).forEach((a) => {
      if (a === 'month') return;
      const raw = toEnglishDigits(String(balForm[a] || '').trim());
      if (raw !== '') { const n = parseFloat(raw); if (!isNaN(n)) entry[a] = n; }
    });
    const next = { ...balances };
    if (editingBalMonth != null && editingBalMonth !== month) delete next[editingBalMonth];
    next[month] = entry;
    persistBalances(next);
    setShowBalForm(false);
  }
  function handleDeleteBalance(month) { const next = { ...balances }; delete next[month]; persistBalances(next); setConfirmDeleteBal(null); }

  function handleExportExcel() { exportExcel(tx, balances, monthInfo); }
  function handleDownloadBackup() { downloadBackup(tx, balances, currentMonth); }

  function handleRestoreBackup(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setBackupMsg('در حال خواندن پشتیبان...');
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (!data || !Array.isArray(data.tx)) { setBackupMsg('فایل پشتیبان معتبر نیست.'); return; }
        persistTx(data.tx);
        if (data.balances) persistBalances(data.balances);
        if (data.currentMonth) persistMonth(data.currentMonth);
        setBackupMsg('بازیابی با موفقیت انجام شد.');
      } catch { setBackupMsg('خطا در خواندن فایل پشتیبان.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleImportNeda(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setImportMsg1('در حال خواندن...');
    readSheet(file, (err, rows) => {
      if (err) { setImportMsg1('خطا در خواندن فایل.'); return; }
      const news = parseNedaRows(rows);
      if (news.length === 0) { setImportMsg1('ردیف معتبری پیدا نشد. ستون‌ها: ماه، روز، عنوان، حساب، مبلغ'); return; }
      let nid = uid(tx);
      const withIds = news.map((r) => ({ ...r, id: nid++ }));
      persistTx([...tx, ...withIds]);
      setImportMsg1(`${toFaDigits(withIds.length)} ردیف هزینه ندا اضافه شد.`);
    });
    e.target.value = '';
  }

  function handleImportGeneral(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setImportMsg2('در حال خواندن...');
    readSheet(file, (err, rows) => {
      if (err) { setImportMsg2('خطا در خواندن فایل.'); return; }
      const news = parseGeneralRows(rows);
      if (news.length === 0) { setImportMsg2('ردیف معتبری پیدا نشد. ستون‌ها: ماه، روز، نوع، دسته(برای درآمد)، عنوان، حساب، مبلغ'); return; }
      let nid = uid(tx);
      const withIds = news.map((r) => ({ ...r, id: nid++ }));
      persistTx([...tx, ...withIds]);
      setImportMsg2(`${toFaDigits(withIds.length)} ردیف اضافه شد.`);
    });
    e.target.value = '';
  }

  if (loading) {
    return (
      <div dir="rtl" style={{ ...fontStyle, background: COLORS.paper, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: COLORS.cover }}>
          <Loader2 className="animate-spin" size={36} style={{ margin: '0 auto 12px' }} />
          <div>در حال باز کردن دفتر...</div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ ...fontStyle, background: COLORS.paper, minHeight: '100vh', color: COLORS.ink }}>
      <Header view={view} setView={setView} />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '18px 16px 60px' }}>
        <CurrentMonthBar currentMonth={currentMonth} onChange={persistMonth} />

        {view === 'home' && (
          <HomeView
            latestBalances={latestBalances}
            form={form} setForm={setForm} formError={formError} editingId={editingId}
            titleSuggestions={titleSuggestions} onSubmit={submitForm} onCancelEdit={openAdd}
            currentMonth={currentMonth} listTx={listTx} visibleCount={visibleCount} setVisibleCount={setVisibleCount}
            saving={saving} confirmDeleteId={confirmDeleteId} setConfirmDeleteId={setConfirmDeleteId}
            onEdit={openEdit} onDelete={handleDelete}
          />
        )}

        {view === 'stats' && (
          <StatsView
            statsTab={statsTab} setStatsTab={setStatsTab}
            statsYear={statsYear} setStatsYear={setStatsYear} yearOptions={yearOptions}
            statsMonth={statsMonth} setStatsMonth={setStatsMonth} monthOptions={monthOptions}
            statsTotal={statsTotal} statsYearly={statsYearly} statsMonthly={statsMonthly}
            dailyChartData={dailyChartData}
            nedaBreakdown={nedaBreakdown} nedaGrandTotal={nedaGrandTotal} nedaChartData={nedaChartData}
          />
        )}

        {view === 'settings' && (
          <SettingsView
            onDownloadBackup={handleDownloadBackup} onRestoreBackup={handleRestoreBackup} backupMsg={backupMsg} backupFileRef={backupFileRef}
            onExportExcel={handleExportExcel}
            onImportNeda={handleImportNeda} importMsg1={importMsg1} nedaFileRef={nedaFileRef}
            onImportGeneral={handleImportGeneral} importMsg2={importMsg2} genFileRef={genFileRef}
            balances={balances} onAddBalance={openAddBalance} onEditBalance={openEditBalance}
            confirmDeleteBal={confirmDeleteBal} setConfirmDeleteBal={setConfirmDeleteBal} onDeleteBalance={handleDeleteBalance}
          />
        )}
      </div>

      {showBalForm && (
        <BalanceFormModal
          balForm={balForm} setBalForm={setBalForm} balError={balError} editingBalMonth={editingBalMonth}
          onSubmit={submitBalForm} onClose={() => setShowBalForm(false)}
        />
      )}
    </div>
  );
}
