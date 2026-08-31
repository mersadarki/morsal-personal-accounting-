import { isExcludedExpenseTitle, isInstallmentTitle, isVpnPartnerTitle } from './format';

// Business-rule formulas, computable over an arbitrary row-set (used at
// کل / سالانه / ماهانه granularities).
export function computeStatsRows(rows) {
  let totalExpense = 0, nedaExpense = 0, installments = 0;
  let kapitan = 0, khadamat = 0, vpnGross = 0, vpnExcluded = 0, vpnPartnerPayout = 0;
  rows.forEach((r) => {
    if (r.t === 'e') {
      // Tracked regardless of the exclusion below, since vpnNet needs it.
      if (isVpnPartnerTitle(r.ti)) vpnPartnerPayout += r.a || 0;
      // جابجایی/قرض rows (flagged via checkbox, or the legacy title-based
      // detection for historical data) are neither income nor expense —
      // they only ever nudge an account balance, handled elsewhere.
      if (r.transfer || r.loan || isExcludedExpenseTitle(r.ti)) return;
      totalExpense += r.a || 0;
      if (r.neda) nedaExpense += r.a || 0;
      if (isInstallmentTitle(r.ti)) installments += r.a || 0;
    } else {
      if (r.cat === 'transfer' || r.transfer || r.loan) return;
      if (r.cat === 'kapitan') kapitan += r.a || 0;
      else if (r.cat === 'khadamat') khadamat += r.a || 0;
      else if (r.cat === 'vpn') { vpnGross += r.a || 0; if (r.personalVpn) vpnExcluded += r.a || 0; }
    }
  });
  // Net vpn income = total vpn-category income, minus any income rows
  // flagged «هزینه شخصی وی‌پی‌ان», minus what's paid out to امیر/وحید
  // (the vpn resale partners — recorded as expense rows titled with their
  // name, e.g. "امیر" or "امیر - ..."), since that payout is a cost of the
  // vpn income, not personal spending.
  const vpnNet = vpnGross - vpnExcluded - vpnPartnerPayout;
  const selfExpenseTotal = totalExpense - nedaExpense;
  const personalExpense = selfExpenseTotal - installments;
  const incomeTotal = kapitan + vpnNet + khadamat;
  return { totalExpense, nedaExpense, installments, selfExpenseTotal, personalExpense, kapitan, khadamat, vpnNet, incomeTotal };
}
