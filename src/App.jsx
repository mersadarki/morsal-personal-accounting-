import { useState, useEffect, useMemo, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { COLORS } from './lib/constants';
import { toEnglishDigits, parseMoneyShorthand, monthInfo, uid, isExcludedExpenseTitle, toFaDigits, jalaliToMonthLabel, advanceMonthLabel, nowHM } from './lib/format';
import { todayDay, todayJalali, tomorrowJalali } from './lib/jalali';
import { TX_KEY, BAL_KEY, MONTH_KEY, DEBTS_KEY, INSTALLMENTS_KEY, storageGet, storageSet } from './lib/storage';
import { computeStatsRows } from './lib/stats';
import { SEED_TX, SEED_BALANCES, SEED_DEBTS, SEED_INSTALLMENTS } from './lib/seed';
import { downloadBackup, exportOwnExpenses, exportNedaExpenses, exportDebts, exportInstallments, exportAllExcel } from './lib/io';
import { fontStyle } from './lib/ui.jsx';
import { useAppUpdate } from './lib/useAppUpdate';

import Header from './components/Header';
import BottomNav from './components/BottomNav';
import CurrentMonthBar from './components/CurrentMonthBar';
import HomeView from './components/home/HomeView';
import InstallmentReminder from './components/home/InstallmentReminder';
import QuickBalanceButtons from './components/home/QuickBalanceButtons';
import StatsView from './components/stats/StatsView';
import DebtsView from './components/debts/DebtsView';
import InstallmentsView from './components/installments/InstallmentsView';
import SettingsView from './components/settings/SettingsView';
import BalanceFormModal from './components/settings/BalanceFormModal';

const emptyBalForm = { month: '', 'ملی': '', 'ویپاد': '', 'اعتبار ملی': '', 'نقدی': '', 'دلار': '' };
function emptyForm() { return { t: 'i', acc: 'ملی', a: '', ti: '', neda: false, transfer: false, loan: false, noStats: false, cat: 'vpn', dt: String(todayDay()) }; }
const DEFAULT_MONTH = 'شهریور ۱۴۰۵';

export default function App() {
  const [tx, setTx] = useState([]);
  const [balances, setBalances] = useState({});
  const [debts, setDebts] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [currentMonth, setCurrentMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('home');
  const [statsTab, setStatsTab] = useState('monthly');
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
  const [statsVisibleExpense, setStatsVisibleExpense] = useState(40);
  const [statsVisibleIncome, setStatsVisibleIncome] = useState(40);
  const [backupMsg, setBackupMsg] = useState('');
  const backupFileRef = useRef(null);
  const update = useAppUpdate();

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
    try {
      const rawD = storageGet(DEBTS_KEY);
      if (rawD) setDebts(JSON.parse(rawD));
      else { setDebts(SEED_DEBTS); storageSet(DEBTS_KEY, JSON.stringify(SEED_DEBTS)); }
    } catch { setDebts(SEED_DEBTS); }
    try {
      const rawI = storageGet(INSTALLMENTS_KEY);
      if (rawI) setInstallments(JSON.parse(rawI));
      else { setInstallments(SEED_INSTALLMENTS); storageSet(INSTALLMENTS_KEY, JSON.stringify(SEED_INSTALLMENTS)); }
    } catch { setInstallments(SEED_INSTALLMENTS); }
    setLoading(false);
  }

  function persistTx(next) { setTx(next); setSaving(true); storageSet(TX_KEY, JSON.stringify(next)); setSaving(false); }
  function persistBalances(next) { setBalances(next); setSaving(true); storageSet(BAL_KEY, JSON.stringify(next)); setSaving(false); }
  function persistMonth(m) { setCurrentMonth(m); storageSet(MONTH_KEY, m); }
  function persistDebts(next) { setDebts(next); storageSet(DEBTS_KEY, JSON.stringify(next)); }
  function persistInstallments(next) { setInstallments(next); storageSet(INSTALLMENTS_KEY, JSON.stringify(next)); }

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
  useEffect(() => { setStatsVisibleExpense(40); setStatsVisibleIncome(40); }, [statsMonth]);

  const currentMonthTx = useMemo(() => tx.filter((r) => r.m === currentMonth).sort((a, b) => b.id - a.id), [tx, currentMonth]);
  const todayTx = useMemo(() => currentMonthTx.filter((r) => r.dt === todayDay()), [currentMonthTx]);
  const listTx = useMemo(() => todayTx.filter((r) => r.t === form.t), [todayTx, form.t]);

  const statsMonthExpenseTx = useMemo(() => tx.filter((r) => r.m === statsMonth && r.t === 'e').sort((a, b) => b.id - a.id), [tx, statsMonth]);
  const statsMonthIncomeTx = useMemo(() => tx.filter((r) => r.m === statsMonth && r.t === 'i').sort((a, b) => b.id - a.id), [tx, statsMonth]);

  const latestBalances = useMemo(() => {
    const entries = Object.entries(balances);
    if (entries.length === 0) return null;
    entries.sort((a, b) => (monthInfo(a[0]).sortKey < monthInfo(b[0]).sortKey ? 1 : -1));
    return { month: entries[0][0], vals: entries[0][1] };
  }, [balances]);

  const installmentReminders = useMemo(() => {
    const todayJ = todayJalali();
    const tomorrowJ = tomorrowJalali();
    const todayM = jalaliToMonthLabel(todayJ);
    const tomorrowM = jalaliToMonthLabel(tomorrowJ);
    const items = [];
    installments.forEach((plan) => {
      plan.entries.forEach((en) => {
        if (en.paid) return;
        if (en.m === todayM && en.dt === todayJ.jd) items.push({ key: `${plan.id}-${en.id}`, name: plan.name, when: 'today', planId: plan.id, entryId: en.id });
        else if (en.m === tomorrowM && en.dt === tomorrowJ.jd) items.push({ key: `${plan.id}-${en.id}`, name: plan.name, when: 'tomorrow', planId: plan.id, entryId: en.id });
      });
    });
    return items;
  }, [installments]);

  const statsTotal = useMemo(() => computeStatsRows(tx), [tx]);
  const statsYearly = useMemo(() => computeStatsRows(tx.filter((r) => monthInfo(r.m).year === statsYear)), [tx, statsYear]);
  const statsMonthly = useMemo(() => computeStatsRows(tx.filter((r) => r.m === statsMonth)), [tx, statsMonth]);

  const dailyChartData = useMemo(() => {
    const days = Array.from({ length: 31 }, (_, i) => ({ day: toFaDigits(i + 1), amount: 0 }));
    tx.filter((r) => r.m === statsMonth && r.t === 'e' && !r.transfer && !r.loan && !r.noStats && !isExcludedExpenseTitle(r.ti) && r.dt).forEach((r) => {
      const idx = r.dt - 1;
      if (idx >= 0 && idx < 31) days[idx].amount += r.a || 0;
    });
    return days;
  }, [tx, statsMonth]);

  const dailyIncomeChartData = useMemo(() => {
    const days = Array.from({ length: 31 }, (_, i) => ({ day: toFaDigits(i + 1), amount: 0 }));
    tx.filter((r) => r.m === statsMonth && r.t === 'i' && !r.transfer && !r.loan && r.cat !== 'transfer' && r.dt).forEach((r) => {
      const idx = r.dt - 1;
      if (idx >= 0 && idx < 31) days[idx].amount += r.a || 0;
    });
    return days;
  }, [tx, statsMonth]);

  const nedaBreakdown = useMemo(() => {
    // No isExcludedExpenseTitle here: every row is already neda-only, and
    // that heuristic exists to match the *main* ledger's own exclusion
    // formula — Neda's free-text descriptions can contain "جابجایی"/"قرض"
    // as ordinary words without meaning "skip this line" (same bug fixed
    // in computeStatsRows).
    const nedaRows = tx.filter((r) => r.t === 'e' && r.neda && !r.transfer && !r.loan && !r.noStats);
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

  function openAdd() { setForm((f) => ({ ...emptyForm(), t: f.t })); setEditingId(null); setFormError(''); }
  function openEdit(r) {
    setForm({ t: r.t, acc: r.acc, a: String(r.a), ti: r.ti || '', neda: !!r.neda, transfer: !!r.transfer, loan: !!r.loan, noStats: !!r.noStats, cat: r.cat || 'vpn', dt: r.dt != null ? String(r.dt) : String(todayDay()) });
    setEditingId(r.id); setFormError('');
    if (r.m && r.m !== currentMonth) persistMonth(r.m);
    setView('home');
  }
  // adjustments: [{ account, delta }, ...] — applied together off the same
  // base so a reversal + re-application (editing an entry) lands correctly
  // in one persist, instead of the second call clobbering the first.
  function adjustBalances(month, adjustments) {
    const current = balances[month] || {};
    const latest = latestBalances ? latestBalances.vals : {};
    const nextEntry = { ...latest, ...current };
    adjustments.forEach(({ account, delta }) => {
      const baseline = nextEntry[account] != null ? nextEntry[account] : 0;
      nextEntry[account] = baseline + delta;
    });
    persistBalances({ ...balances, [month]: nextEntry });
  }
  function adjustBalance(month, account, delta) { adjustBalances(month, [{ account, delta }]); }
  function txBalanceDelta(rec) { return rec.t === 'i' ? rec.a : -rec.a; }

  function submitForm(e) {
    e.preventDefault();
    const amt = parseMoneyShorthand(form.a);
    if (isNaN(amt) || amt <= 0) { setFormError('مبلغ را درست وارد کنید.'); return; }
    const dtVal = form.dt ? parseInt(toEnglishDigits(String(form.dt)), 10) : null;
    const base = { acc: form.acc, a: amt, m: currentMonth, dt: (dtVal && !isNaN(dtVal)) ? dtVal : null, transfer: form.transfer, loan: form.loan };

    if (form.t === 'i') {
      const rec = { ...base, t: 'i', ti: '', cat: form.cat };
      if (editingId != null) {
        const oldRec = tx.find((r) => r.id === editingId);
        // Merge onto the old row (not a full replace) so fields the form
        // doesn't own — like the creation timestamp — survive an edit.
        persistTx(tx.map((r) => (r.id === editingId ? { ...r, ...rec } : r)));
        const adjustments = oldRec ? [{ account: oldRec.acc, delta: -txBalanceDelta(oldRec) }] : [];
        adjustments.push({ account: form.acc, delta: amt });
        adjustBalances(currentMonth, adjustments);
      } else {
        // Always a new row — silently folding a same-day/same-account/
        // same-category entry into an existing one hid the actual count
        // of transactions (the same bug already fixed for the quick-add
        // buttons), which is exactly what the grouped home-page list
        // needs to show correctly.
        persistTx([...tx, { ...rec, id: uid(tx), hm: nowHM() }]);
        adjustBalance(currentMonth, form.acc, amt);
      }
    } else {
      const rec = { ...base, t: 'e', ti: form.ti.trim(), neda: form.neda, noStats: form.noStats };
      if (editingId != null) {
        const oldRec = tx.find((r) => r.id === editingId);
        persistTx(tx.map((r) => (r.id === editingId ? { ...r, ...rec } : r)));
        const adjustments = oldRec ? [{ account: oldRec.acc, delta: -txBalanceDelta(oldRec) }] : [];
        adjustments.push({ account: form.acc, delta: -amt });
        adjustBalances(currentMonth, adjustments);
      } else {
        persistTx([...tx, { ...rec, id: uid(tx), hm: nowHM() }]);
        adjustBalance(currentMonth, form.acc, -amt);
      }
    }
    setForm((f) => ({ ...emptyForm(), t: f.t }));
    setEditingId(null);
  }
  function handleDelete(id) {
    const rec = tx.find((r) => r.id === id);
    if (rec) adjustBalance(rec.m, rec.acc, -txBalanceDelta(rec));
    persistTx(tx.filter((r) => r.id !== id));
    setConfirmDeleteId(null);
  }

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
      const raw = String(balForm[a] || '').trim();
      // دلار is stored as a plain dollar count, not hezar-toman, so the
      // X/Y "million/thousand toman" shorthand doesn't apply to it.
      if (raw !== '') { const n = a === 'دلار' ? parseFloat(toEnglishDigits(raw)) : parseMoneyShorthand(raw); if (!isNaN(n)) entry[a] = n; }
    });
    const next = { ...balances };
    if (editingBalMonth != null && editingBalMonth !== month) delete next[editingBalMonth];
    next[month] = entry;
    persistBalances(next);
    setShowBalForm(false);
  }
  function handleDeleteBalance(month) { const next = { ...balances }; delete next[month]; persistBalances(next); setConfirmDeleteBal(null); }

  // Always adds its own new row — merging into an existing same-day vpn
  // entry made the +500 tap look like it did nothing, since the number on
  // an already-there row just ticked up instead of a new line appearing.
  function quickAddBalance(account) {
    adjustBalance(currentMonth, account, 500);
    const dt = todayDay();
    persistTx([...tx, { t: 'i', m: currentMonth, dt, acc: account, a: 500, ti: '', cat: 'vpn', id: uid(tx), hm: nowHM() }]);
    setForm((f) => ({ ...f, t: 'i' }));
  }

  function addDebtPerson(name) { persistDebts([...debts, { id: uid(debts), person: name, entries: [] }]); }
  // items: [{ delta, note }, ...] — added together in one persist so a
  // simultaneous +/- entry pair gets distinct, non-colliding ids.
  function addDebtEntries(personId, items) {
    persistDebts(debts.map((d) => {
      if (d.id !== personId) return d;
      let nid = d.entries.reduce((m, e) => Math.max(m, e.id || 0), 0);
      const newEntries = items.map((it) => { nid += 1; return { id: nid, delta: it.delta, note: it.note }; });
      return { ...d, entries: [...d.entries, ...newEntries] };
    }));
  }
  function editDebtEntry(personId, entryId, delta, note) {
    persistDebts(debts.map((d) => (d.id !== personId ? d : {
      ...d, entries: d.entries.map((e) => (e.id === entryId ? { ...e, delta, note } : e)),
    })));
  }
  function deleteDebtEntry(personId, entryId) {
    persistDebts(debts.map((d) => (d.id === personId ? { ...d, entries: d.entries.filter((e) => e.id !== entryId) } : d)));
  }
  function deleteDebtPerson(personId) { persistDebts(debts.filter((d) => d.id !== personId)); }
  // Flips every entry's sign for one person — for correcting a person whose
  // debt/claim direction was recorded backwards, without losing their entry
  // history (each amount and note stays, only the +/− flips).
  function flipDebtEntries(personId) {
    persistDebts(debts.map((d) => (d.id !== personId ? d : {
      ...d, entries: d.entries.map((e) => ({ ...e, delta: -e.delta })),
    })));
  }

  // startMonth/day/count are optional — when given, the plan is created
  // with its first due date(s) already in place (via the same bulk-months
  // logic as addInstallmentDate) instead of an empty plan you then have to
  // expand and add a date to separately.
  function addInstallmentPlan(name, recurring, startMonth, day, count) {
    let entries = [];
    if (startMonth) {
      const months = [];
      const n = Math.max(1, count || 1);
      for (let i = 0; i < n; i += 1) {
        const label = i === 0 ? startMonth : advanceMonthLabel(startMonth, i);
        if (label) months.push(label);
      }
      let nid = 0;
      entries = months.map((m) => { nid += 1; return { id: nid, m, dt: day, paid: false }; });
    }
    persistInstallments([...installments, { id: uid(installments), name, amount: null, recurring: !!recurring, entries }]);
  }
  function setInstallmentRecurring(planId, recurring) {
    persistInstallments(installments.map((p) => (p.id === planId ? { ...p, recurring } : p)));
  }
  function editInstallmentPlan(planId, updates) {
    persistInstallments(installments.map((p) => (p.id === planId ? { ...p, ...updates } : p)));
  }
  // Parses one plan per line — "<amount> <day> <title...>" (amount accepts
  // the same X/Y shorthand as everywhere else) — for pasting in a whole
  // month's worth of bills at once instead of adding each by hand. All
  // bulk-added plans start as fixed-term (not recurring) — whether
  // something never ends (like a gym membership) isn't something a title
  // can reliably signal, so it's left for you to flip on per-plan
  // afterward via the "ماهانه" checkbox on that plan. New plans go on top
  // of the existing list, each seeded with one due-date entry for the
  // current month.
  function bulkAddInstallmentPlans(rawText) {
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    let nextId = installments.reduce((m, p) => Math.max(m, p.id || 0), 0);
    const parsed = [];
    lines.forEach((line) => {
      const tokens = line.split(/\s+/);
      if (tokens.length < 3) return;
      const amt = parseMoneyShorthand(tokens[0]);
      const day = parseInt(toEnglishDigits(tokens[1]), 10);
      const title = tokens.slice(2).join(' ');
      if (isNaN(amt) || isNaN(day) || !title) return;
      nextId += 1;
      parsed.push({ id: nextId, name: title, amount: amt, recurring: false, entries: [{ id: 1, m: currentMonth, dt: day, paid: false }] });
    });
    if (parsed.length === 0) return;
    persistInstallments([...parsed, ...installments]);
  }
  // count > 1 bulk-generates that many consecutive months from `m` onward
  // (same day each month) instead of adding just the one — for a fixed
  // installment where you already know it's N months of the same payment.
  // Months that already have an entry are skipped rather than duplicated.
  function addInstallmentDate(planId, m, dt, count = 1) {
    const months = [];
    for (let i = 0; i < count; i += 1) {
      const label = i === 0 ? m : advanceMonthLabel(m, i);
      if (label) months.push(label);
    }
    persistInstallments(installments.map((p) => {
      if (p.id !== planId) return p;
      let nid = p.entries.reduce((mx, e) => Math.max(mx, e.id || 0), 0);
      const existing = new Set(p.entries.map((e) => e.m));
      const newEntries = months.filter((mo) => !existing.has(mo)).map((mo) => { nid += 1; return { id: nid, m: mo, dt, paid: false }; });
      return { ...p, entries: [...p.entries, ...newEntries] };
    }));
  }
  // A fixed-term plan (not recurring) with at least one entry, all of them
  // paid, is fully settled — it drops off the list on its own instead of
  // sitting there forever like a debt that's already been paid off.
  function isInstallmentComplete(p) { return !p.recurring && p.entries.length > 0 && p.entries.every((e) => e.paid); }
  function toggleInstallmentPaid(planId, entryId) {
    const next = installments
      .map((p) => (p.id !== planId ? p : {
        ...p, entries: p.entries.map((e) => (e.id === entryId ? { ...e, paid: !e.paid } : e)),
      }))
      .filter((p) => !isInstallmentComplete(p));
    persistInstallments(next);
  }
  function deleteInstallmentDate(planId, entryId) {
    persistInstallments(installments.map((p) => (p.id === planId ? { ...p, entries: p.entries.filter((e) => e.id !== entryId) } : p)));
  }
  function deleteInstallmentPlan(planId) { persistInstallments(installments.filter((p) => p.id !== planId)); }

  function handleExportOwnExpenses() { exportOwnExpenses(tx, monthInfo); }
  function handleExportNedaExpenses() { exportNedaExpenses(tx, monthInfo); }
  function handleExportDebts() { exportDebts(debts); }
  function handleExportInstallments() { exportInstallments(installments); }
  function handleExportAllExcel() { exportAllExcel(tx, monthInfo, debts, installments); }
  function handleDownloadBackup() { downloadBackup(tx, balances, debts, installments, currentMonth); }

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
        if (data.debts) persistDebts(data.debts);
        if (data.installments) persistInstallments(data.installments);
        if (data.currentMonth) persistMonth(data.currentMonth);
        setBackupMsg('بازیابی با موفقیت انجام شد.');
      } catch { setBackupMsg('خطا در خواندن فایل پشتیبان.'); }
    };
    reader.readAsText(file);
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
      <Header />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '18px 16px', paddingBottom: 'calc(84px + env(safe-area-inset-bottom))' }}>
        <CurrentMonthBar currentMonth={currentMonth} onChange={persistMonth} />

        {view === 'home' && (
          <>
            <InstallmentReminder items={installmentReminders} onDismiss={toggleInstallmentPaid} />
            <QuickBalanceButtons onQuickAdd={quickAddBalance} />
            <HomeView
              latestBalances={latestBalances}
              form={form} setForm={setForm} formError={formError} editingId={editingId}
              titleSuggestions={titleSuggestions} onSubmit={submitForm} onCancelEdit={openAdd}
              listTx={listTx} visibleCount={visibleCount} setVisibleCount={setVisibleCount}
              saving={saving} confirmDeleteId={confirmDeleteId} setConfirmDeleteId={setConfirmDeleteId}
              onEdit={openEdit} onDelete={handleDelete} onEditBalance={openEditBalance}
            />
          </>
        )}

        {view === 'debts' && (
          <DebtsView
            debts={debts} onAddPerson={addDebtPerson} onAddEntries={addDebtEntries}
            onEditEntry={editDebtEntry} onDeleteEntry={deleteDebtEntry} onDeletePerson={deleteDebtPerson}
            onFlip={flipDebtEntries}
          />
        )}

        {view === 'installments' && (
          <InstallmentsView
            installments={installments} currentMonth={currentMonth} onAddPlan={addInstallmentPlan} onAddDate={addInstallmentDate}
            onTogglePaid={toggleInstallmentPaid} onDeleteDate={deleteInstallmentDate} onDeletePlan={deleteInstallmentPlan}
            onBulkAdd={bulkAddInstallmentPlans} onSetRecurring={setInstallmentRecurring} onEditPlan={editInstallmentPlan}
          />
        )}

        {view === 'stats' && (
          <StatsView
            statsTab={statsTab} setStatsTab={setStatsTab}
            statsYear={statsYear} setStatsYear={setStatsYear} yearOptions={yearOptions}
            statsMonth={statsMonth} setStatsMonth={setStatsMonth} monthOptions={monthOptions}
            statsTotal={statsTotal} statsYearly={statsYearly} statsMonthly={statsMonthly}
            dailyChartData={dailyChartData} dailyIncomeChartData={dailyIncomeChartData}
            nedaBreakdown={nedaBreakdown} nedaGrandTotal={nedaGrandTotal}
            statsMonthExpenseTx={statsMonthExpenseTx} statsMonthIncomeTx={statsMonthIncomeTx}
            statsVisibleExpense={statsVisibleExpense} setStatsVisibleExpense={setStatsVisibleExpense}
            statsVisibleIncome={statsVisibleIncome} setStatsVisibleIncome={setStatsVisibleIncome}
            saving={saving} confirmDeleteId={confirmDeleteId} setConfirmDeleteId={setConfirmDeleteId}
            onEdit={openEdit} onDelete={handleDelete}
          />
        )}

        {view === 'settings' && (
          <SettingsView
            onDownloadBackup={handleDownloadBackup} onRestoreBackup={handleRestoreBackup} backupMsg={backupMsg} backupFileRef={backupFileRef}
            onExportOwnExpenses={handleExportOwnExpenses} onExportNedaExpenses={handleExportNedaExpenses}
            onExportDebts={handleExportDebts} onExportInstallments={handleExportInstallments} onExportAllExcel={handleExportAllExcel}
            balances={balances} onEditBalance={openEditBalance}
            confirmDeleteBal={confirmDeleteBal} setConfirmDeleteBal={setConfirmDeleteBal} onDeleteBalance={handleDeleteBalance}
            update={update}
          />
        )}
      </div>

      {showBalForm && (
        <BalanceFormModal
          balForm={balForm} setBalForm={setBalForm} balError={balError} editingBalMonth={editingBalMonth}
          onSubmit={submitBalForm} onClose={() => setShowBalForm(false)}
        />
      )}
      <BottomNav view={view} setView={setView} />
    </div>
  );
}
