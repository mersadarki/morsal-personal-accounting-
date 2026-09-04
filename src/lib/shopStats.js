// Aggregation helpers for the shop module (sales/purchases/archives),
// independent of the ledger's own computeStatsRows — a sale's profit is
// per-row (qty * (salePrice - purchasePrice)) rather than derived from a
// business-rule formula over categories.

export function isoToday() { return new Date().toISOString().slice(0, 10); }
export function isoDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// Totals a set of sale rows, split by category (phone/accessory) as well
// as combined — every stats granularity (daily/weekly/monthly/yearly)
// reuses this over a differently-filtered row set.
export function computeSalesTotals(rows) {
  const t = {
    totalSale: 0, totalProfit: 0, qty: 0,
    phone: { sale: 0, profit: 0, qty: 0 },
    accessory: { sale: 0, profit: 0, qty: 0 },
  };
  (rows || []).forEach((r) => {
    t.totalSale += r.totalSale || 0;
    t.totalProfit += r.totalProfit || 0;
    t.qty += r.qty || 0;
    const bucket = r.category === 'accessory' ? t.accessory : t.phone;
    bucket.sale += r.totalSale || 0;
    bucket.profit += r.totalProfit || 0;
    bucket.qty += r.qty || 0;
  });
  return t;
}

// Folds archive rows (manual previous-years summaries, no itemized sales)
// matching a year into a totals object already computed from real sale
// rows. For the yearly view (month == null) every row for that year counts
// — a whole-year lump sum and/or a set of per-month rows. For a monthly
// view, only rows entered against that exact month count — a whole-year
// row never contributes to one specific month.
export function addArchiveTotals(totals, archives, year, month) {
  const out = { ...totals, phone: { ...totals.phone }, accessory: { ...totals.accessory } };
  (archives || []).forEach((a) => {
    if (a.year !== year) return;
    if (month != null && a.month !== month) return;
    out.totalSale += a.totalSales || 0;
    out.totalProfit += a.totalProfit || 0;
    out.qty += a.qty || 0;
    const bucket = a.category === 'accessory' ? out.accessory : a.category === 'phone' ? out.phone : null;
    if (bucket) { bucket.sale += a.totalSales || 0; bucket.profit += a.totalProfit || 0; bucket.qty += a.qty || 0; }
  });
  return out;
}
