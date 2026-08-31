import { useState, lazy, Suspense } from 'react';
import { ChevronRight, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { ACCOUNT_LABELS, COLORS } from '../../lib/constants';
import { toFaDigits } from '../../lib/format';
import { displayStyle, iconBtn, Amount } from '../../lib/ui.jsx';

const NedaChart = lazy(() => import('./NedaChart'));

export default function NedaBreakdown({ nedaBreakdown, nedaGrandTotal }) {
  const [expandedYear, setExpandedYear] = useState(null);
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [chartYearIdx, setChartYearIdx] = useState(0);

  function toggleYear(year) {
    if (expandedYear === year) { setExpandedYear(null); setExpandedMonth(null); }
    else { setExpandedYear(year); setExpandedMonth(null); }
  }
  function toggleMonth(month) {
    setExpandedMonth((cur) => (cur === month ? null : month));
  }

  const chartYear = nedaBreakdown[chartYearIdx];
  const chartYearData = chartYear
    ? [...chartYear.months].sort((a, b) => (a.sortKey < b.sortKey ? -1 : 1)).map((m) => ({ label: m.month, amount: m.total }))
    : [];

  return (
    <div>
      <div style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 14, marginBottom: 14, textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: COLORS.inkLight, marginBottom: 4 }}>مجموع کل هزینه‌های ندا</div>
        <div className="tabular" style={{ fontSize: 22, fontWeight: 800, color: COLORS.expense }}><Amount value={nedaGrandTotal} /></div>
      </div>

      {nedaBreakdown.length > 0 && (
        <div style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 12, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <button
              onClick={() => setChartYearIdx((i) => Math.min(i + 1, nedaBreakdown.length - 1))}
              disabled={chartYearIdx >= nedaBreakdown.length - 1}
              style={{ ...iconBtn(COLORS.cover), opacity: chartYearIdx >= nedaBreakdown.length - 1 ? 0.3 : 1 }}
            >
              <ChevronRight size={16} />
            </button>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.cover }}>
              پراکندگی هزینه ندا — سال {toFaDigits(chartYear ? chartYear.year : '')}
            </div>
            <button
              onClick={() => setChartYearIdx((i) => Math.max(i - 1, 0))}
              disabled={chartYearIdx <= 0}
              style={{ ...iconBtn(COLORS.cover), opacity: chartYearIdx <= 0 ? 0.3 : 1 }}
            >
              <ChevronLeft size={16} />
            </button>
          </div>
          <Suspense fallback={<div style={{ height: 180 }} />}>
            <NedaChart data={chartYearData} />
          </Suspense>
        </div>
      )}

      {nedaBreakdown.length === 0 && (
        <div style={{ padding: 30, textAlign: 'center', color: COLORS.inkLight, fontSize: 13, background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12 }}>هزینه‌ای برای ندا ثبت نشده.</div>
      )}
      {nedaBreakdown.map((y) => {
        const yearOpen = expandedYear === y.year;
        return (
          <div key={y.year} style={{ marginBottom: 10 }}>
            <button
              onClick={() => toggleYear(y.year)}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12, cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {yearOpen ? <ChevronUp size={15} color={COLORS.inkLight} /> : <ChevronDown size={15} color={COLORS.inkLight} />}
                <div style={{ ...displayStyle, fontSize: 16, color: COLORS.cover }}>سال {toFaDigits(y.year)}</div>
              </div>
              <div className="tabular" style={{ fontSize: 13, fontWeight: 700, color: COLORS.expense }}><Amount value={y.yearTotal} /></div>
            </button>
            {yearOpen && (
              <div style={{ marginTop: 6, paddingRight: 8 }}>
                {y.months.map((mo) => {
                  const monthOpen = expandedMonth === mo.month;
                  return (
                    <div key={mo.month} style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12, marginBottom: 8, overflow: 'hidden' }}>
                      <button
                        onClick={() => toggleMonth(mo.month)}
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: COLORS.paperDark, cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {monthOpen ? <ChevronUp size={13} color={COLORS.inkLight} /> : <ChevronDown size={13} color={COLORS.inkLight} />}
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{mo.month}</div>
                        </div>
                        <div className="tabular" style={{ fontSize: 13, fontWeight: 700, color: COLORS.expense }}><Amount value={mo.total} /></div>
                      </button>
                      {monthOpen && mo.rows.map((r) => (
                        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderTop: `1px solid ${COLORS.line}` }}>
                          <div style={{ flex: 1, fontSize: 12.5 }}>{r.ti || 'بدون عنوان'}</div>
                          <div style={{ fontSize: 11, color: COLORS.inkLight }}>{ACCOUNT_LABELS[r.acc] || r.acc}{r.dt ? ` · روز ${toFaDigits(r.dt)}` : ''}</div>
                          <div className="tabular" style={{ fontSize: 12.5, fontWeight: 700, color: COLORS.expense }}><Amount value={r.a} /></div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
