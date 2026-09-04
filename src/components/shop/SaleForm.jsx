import { useEffect, useMemo, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { COLORS, SHOP_CATEGORY_LABELS } from '../../lib/constants';
import { parseMoneyShorthand, jalaliToMonthLabel, toFaDigits } from '../../lib/format';
import { todayJalali } from '../../lib/jalali';
import { FieldLabel, AmountInput, AmountPreview, inputStyle, primaryBtn, Amount } from '../../lib/ui.jsx';
import JalaliDateFields from './JalaliDateFields';

// Product-name autocomplete (a datalist over every in-stock item, across
// both categories) is the whole point here — typing/picking a known name
// recognizes the item and pulls in its code/purchase price automatically,
// so a daily sale is just "name, quantity, sale price".
export default function SaleForm({ products, onAddSale }) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('1');
  const [unitSalePrice, setUnitSalePrice] = useState('');
  const [date, setDate] = useState(() => todayJalali());
  const [error, setError] = useState('');
  const [primedFor, setPrimedFor] = useState('');

  const activeProducts = useMemo(() => products.filter((p) => !p.archived), [products]);
  const matched = useMemo(() => {
    const n = name.trim().toLowerCase();
    if (!n) return null;
    return activeProducts.find((p) => p.name.trim().toLowerCase() === n) || null;
  }, [name, activeProducts]);

  // Prefill the sale price with the product's own suggested/purchase
  // price only once per match (not on every keystroke) — otherwise typing
  // over a manually-adjusted price would keep getting overwritten.
  useEffect(() => {
    if (!matched || primedFor === matched.id) return;
    setPrimedFor(matched.id);
    setUnitSalePrice(String(matched.salePrice != null ? matched.salePrice : matched.purchasePrice || ''));
  }, [matched, primedFor]);

  const q = parseInt(String(qty || '0').trim(), 10) || 0;
  const price = parseMoneyShorthand(unitSalePrice);
  const profit = matched && !isNaN(price) ? q * (price - (matched.purchasePrice || 0)) : null;

  function reset() {
    setName(''); setQty('1'); setUnitSalePrice(''); setPrimedFor(''); setError('');
  }

  function submit(e) {
    e.preventDefault();
    if (!matched) { setError('این کالا در انبار پیدا نشد — اول از تب انبار اضافه‌ش کن.'); return; }
    if (q <= 0) { setError('تعداد را درست وارد کنید.'); return; }
    if (isNaN(price) || price < 0) { setError('قیمت فروش را درست وارد کنید.'); return; }
    const m = jalaliToMonthLabel(date);
    onAddSale({ productId: matched.id, qty: q, unitSalePrice: price, jy: date.jy, jm: date.jm, jd: date.jd, m, dt: date.jd });
    reset();
  }

  return (
    <form onSubmit={submit} style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
      <FieldLabel>اسم کالا</FieldLabel>
      <input
        autoFocus list="shopSaleNames" value={name} onChange={(e) => setName(e.target.value)}
        placeholder="شروع کن به تایپ کردن اسم کالا..." style={{ ...inputStyle, width: '100%', marginBottom: 6 }}
      />
      <datalist id="shopSaleNames">
        {activeProducts.map((p) => <option key={p.id} value={p.name}>{`${SHOP_CATEGORY_LABELS[p.category]} · موجودی ${p.stock || 0}`}</option>)}
      </datalist>

      {matched ? (
        <div style={{ fontSize: 11.5, color: COLORS.inkLight, marginBottom: 10, lineHeight: 1.9 }}>
          {SHOP_CATEGORY_LABELS[matched.category]} · کد: <span style={{ fontFamily: 'monospace' }}>{matched.code || '—'}</span> · موجودی: <b style={{ color: (matched.stock || 0) <= 0 ? COLORS.expense : COLORS.ink }}>{toFaDigits(matched.stock || 0)}</b> · خرید: {toFaDigits(matched.purchasePrice || 0)} هزار ت
        </div>
      ) : name.trim() ? (
        <div style={{ fontSize: 11.5, color: COLORS.expense, marginBottom: 10 }}>این کالا در انبار پیدا نشد.</div>
      ) : (
        <div style={{ fontSize: 11.5, color: COLORS.inkLight, marginBottom: 10 }}>اسم رو بنویس تا از انبار پیشنهاد داده بشه.</div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <FieldLabel>تعداد</FieldLabel>
          <input inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
        </div>
        <div style={{ flex: 2 }}>
          <FieldLabel>قیمت فروش واحد</FieldLabel>
          <AmountInput value={unitSalePrice} onChange={(e) => setUnitSalePrice(e.target.value)} />
          <AmountPreview value={unitSalePrice} />
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <FieldLabel>تاریخ فروش</FieldLabel>
        <JalaliDateFields value={date} onChange={setDate} />
      </div>

      {profit != null && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: COLORS.paperDark, borderRadius: 8, padding: '8px 10px', marginBottom: 8, fontSize: 12.5 }}>
          <span style={{ color: COLORS.inkLight }}>سود این فروش</span>
          <span className="tabular" style={{ fontWeight: 800, color: profit >= 0 ? COLORS.income : COLORS.expense }}><Amount value={profit} sign={profit >= 0 ? '+' : ''} /></span>
        </div>
      )}

      {error && <div style={{ color: COLORS.expense, fontSize: 12, marginBottom: 8 }}>{error}</div>}
      <button type="submit" style={{ ...primaryBtn, width: '100%', justifyContent: 'center' }}><ShoppingCart size={15} /> ثبت فروش</button>
    </form>
  );
}
