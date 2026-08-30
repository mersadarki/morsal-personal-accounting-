import { isTransferExpenseTitle, isInstallmentTitle } from './format';

// Business-rule formulas, computable over an arbitrary row-set (used at
// کل / سالانه / ماهانه granularities).
export function computeStatsRows(rows) {
  let totalExpense = 0, nedaExpense = 0, installments = 0;
  let kapitan = 0, khadamat = 0, vpnGross = 0, vpnExcluded = 0;
  rows.forEach((r) => {
    if (r.t === 'e') {
      if (isTransferExpenseTitle(r.ti)) return;
      totalExpense += r.a || 0;
      if (r.neda) nedaExpense += r.a || 0;
      if (isInstallmentTitle(r.ti)) installments += r.a || 0;
    } else {
      if (r.cat === 'transfer') return;
      if (r.cat === 'kapitan') kapitan += r.a || 0;
      else if (r.cat === 'khadamat') khadamat += r.a || 0;
      else if (r.cat === 'vpn') { vpnGross += r.a || 0; if (r.personalVpn) vpnExcluded += r.a || 0; }
    }
  });
  const vpnNet = vpnGross - vpnExcluded;
  const selfExpenseTotal = totalExpense - nedaExpense;
  const personalExpense = selfExpenseTotal - installments;
  const incomeTotal = kapitan + vpnNet + khadamat;
  return { totalExpense, nedaExpense, installments, selfExpenseTotal, personalExpense, kapitan, khadamat, vpnNet, incomeTotal };
}
