import { isExcludedExpenseTitle, isInstallmentTitle, isVpnPartnerTitle, isVpnNewExpenseTitle } from './format';

// Business-rule formulas, computable over an arbitrary row-set (used at
// کل / سالانه / ماهانه granularities).
export function computeStatsRows(rows) {
  let totalExpense = 0, nedaExpense = 0, installments = 0;
  let kapitan = 0, khadamat = 0, vpnGross = 0, vpnPartnerPayout = 0;
  let vpnNewGross = 0, vpnNewCost = 0;
  rows.forEach((r) => {
    if (r.t === 'e') {
      // "فقط از موجودی کم شه" — a plain balance adjustment the user
      // explicitly wants out of every stats calculation entirely (not just
      // totalExpense), so it's checked before anything else is tallied.
      if (r.noStats) return;
      // Tracked regardless of the exclusion below, since vpnNet/vpnNewProfit need them.
      if (isVpnPartnerTitle(r.ti)) vpnPartnerPayout += r.a || 0;
      if (isVpnNewExpenseTitle(r.ti)) vpnNewCost += r.a || 0;
      // جابجایی/قرض rows (flagged via checkbox, or the legacy title-based
      // detection for historical data) are neither income nor expense —
      // they only ever nudge an account balance, handled elsewhere. The
      // title-text heuristic is scoped to non-neda rows only: it exists to
      // match the main ledger's own exclusion formula for that sheet's
      // column A, but Neda's expenses come from an entirely separate,
      // itemized sheet whose free-text descriptions can legitimately
      // contain "جابجایی"/"قرض" as ordinary words (e.g. "جابجایی و ضرر
      // زیان") without meaning "skip this line" — applying that heuristic
      // there silently dropped real Neda spending.
      if (r.transfer || r.loan || (!r.neda && isExcludedExpenseTitle(r.ti))) return;
      totalExpense += r.a || 0;
      if (r.neda) nedaExpense += r.a || 0;
      if (isInstallmentTitle(r.ti)) installments += r.a || 0;
    } else {
      if (r.cat === 'transfer' || r.transfer || r.loan) return;
      if (r.cat === 'kapitan') kapitan += r.a || 0;
      else if (r.cat === 'khadamat') khadamat += r.a || 0;
      else if (r.cat === 'vpn') vpnGross += r.a || 0;
      else if (r.cat === 'vpnNew') vpnNewGross += r.a || 0;
    }
  });
  // Net vpn income = total vpn-category income, minus what's paid out to
  // امیر/وحید (the vpn resale partners — recorded as expense rows titled
  // with their name), since that payout is a cost of the vpn income, not
  // personal spending.
  const vpnNet = vpnGross - vpnPartnerPayout;
  // vpn-new is a separate scheme (its own cost/revenue pair, ported from
  // the user's own spreadsheet formula: SUMIF(income cat=vpn new) minus
  // SUMIF(expense title="vpn new")). Its cost is already excluded from
  // totalExpense above (isExcludedExpenseTitle), so only the net profit
  // gets folded into income here — otherwise the cost would vanish from
  // both sides instead of being netted against its own revenue.
  const vpnNewProfit = vpnNewGross - vpnNewCost;
  const selfExpenseTotal = totalExpense - nedaExpense;
  const personalExpense = selfExpenseTotal - installments;
  const incomeTotal = kapitan + vpnNet + khadamat + vpnNewProfit;
  return { totalExpense, nedaExpense, installments, selfExpenseTotal, personalExpense, kapitan, khadamat, vpnNet, vpnNewProfit, incomeTotal };
}
