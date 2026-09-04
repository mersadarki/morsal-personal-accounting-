import { useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { COLORS, SHOP_CATEGORY_LABELS } from '../../lib/constants';
import { parseMoneyShorthand, jalaliToMonthLabel, toFaDigits } from '../../lib/format';
import { todayJalali } from '../../lib/jalali';
import { buildProductCode, nextSeqForPrefix } from '../../lib/priceCipher';
import { FieldLabel, AmountInput, AmountPreview, inputStyle, primaryBtn } from '../../lib/ui.jsx';
import JalaliDateFields from './JalaliDateFields';

// One form, two behaviors: typing a name that already exists in this
// category switches it into "restock" mode (add quantity + update the
// purchase/sale price on the existing product) instead of creating a
// duplicate — so "add a new item" and "update an item" are the same
// action from the user's side, exactly what was asked for.
export default function ProductForm({ category, products, prefix, cipherKey, onAddNew, onRestock }) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [code, setCode] = useState('');
  const [codeEdited, setCodeEdited] = useState(false);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => todayJalali());
  const [error, setError] = useState('');

  const categoryProducts = useMemo(() => products.filter((p) => p.category === category), [products, category]);
  const matched = useMemo(() => {
    const n = name.trim().toLowerCase();
    if (!n) return null;
    return categoryProducts.find((p) => p.name.trim().toLowerCase() === n) || null;
  }, [name, categoryProducts]);

  useEffect(() => {
    if (matched || codeEdited) return;
    const seq = nextSeqForPrefix(products, prefix);
    const priceVal = parseMoneyShorthand(unitPrice);
    setCode(buildProductCode(prefix, seq, isNaN(priceVal) ? 0 : priceVal, cipherKey));
  }, [unitPrice, matched, prefix, cipherKey, products, codeEdited]);

  function reset() {
    setName(''); setQty(''); setUnitPrice(''); setSalePrice(''); setCode(''); setCodeEdited(false); setNote(''); setError('');
  }

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) { setError('اسم کالا را وارد کنید.'); return; }
    const price = parseMoneyShorthand(unitPrice);
    if (isNaN(price) || price < 0) { setError('قیمت خرید را درست وارد کنید.'); return; }
    const q = parseInt(String(qty || '0').trim(), 10) || 0;
    const sale = salePrice.trim() ? parseMoneyShorthand(salePrice) : null;
    const m = jalaliToMonthLabel(date);
    const common = { jy: date.jy, jm: date.jm, jd: date.jd, m, dt: date.jd, note: note.trim() };

    if (matched) {
      if (q <= 0) { setError('تعداد ورودی جدید را وارد کنید.'); return; }
      onRestock(matched.id, { qty: q, unitPrice: price, salePrice: sale, ...common });
    } else {
      onAddNew({ category, name: name.trim(), code: code.trim(), purchasePrice: price, salePrice: sale, qty: q, ...common });
    }
    reset();
  }

  return (
    <form onSubmit={submit} style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
      <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>
        {matched ? `به‌روزرسانی موجودی — ${SHOP_CATEGORY_LABELS[category]}` : `افزودن ${SHOP_CATEGORY_LABELS[category]} جدید`}
      </div>

      <FieldLabel>اسم کالا</FieldLabel>
      <input
        list={`shopNames-${category}`} value={name} onChange={(e) => setName(e.target.value)}
        placeholder="مثلاً: سامسونگ A54 128" style={{ ...inputStyle, width: '100%', marginBottom: 8 }}
      />
      <datalist id={`shopNames-${category}`}>
        {categoryProducts.map((p) => <option key={p.id} value={p.name} />)}
      </datalist>

      {matched && (
        <div style={{ fontSize: 11.5, color: COLORS.inkLight, marginBottom: 8, lineHeight: 1.9 }}>
          کالای موجود پیدا شد — موجودی فعلی: <b>{toFaDigits(matched.stock || 0)}</b>، قیمت خرید فعلی: <b>{toFaDigits(matched.purchasePrice || 0)}</b> هزار ت، کد: <b>{matched.code || '—'}</b>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <FieldLabel>{matched ? 'تعداد ورودی جدید' : 'موجودی اولیه'}</FieldLabel>
          <input inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="۱" style={{ ...inputStyle, width: '100%' }} />
        </div>
        <div style={{ flex: 2 }}>
          <FieldLabel>{matched ? 'قیمت خرید واحد جدید' : 'قیمت خرید واحد'}</FieldLabel>
          <AmountInput value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
          <AmountPreview value={unitPrice} />
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <FieldLabel>قیمت فروش پیشنهادی (اختیاری — برای محاسبه‌ی سود در فروش روزانه)</FieldLabel>
        <AmountInput value={salePrice} onChange={(e) => setSalePrice(e.target.value)} />
        <AmountPreview value={salePrice} />
      </div>

      {!matched && (
        <div style={{ marginBottom: 8 }}>
          <FieldLabel>کد کالا (خودکار پیشنهاد می‌شه — شامل رمز قیمت خرید بعد از خط تیره)</FieldLabel>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={code} onChange={(e) => { setCode(e.target.value); setCodeEdited(true); }}
              style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', direction: 'ltr', textAlign: 'left' }}
            />
            <button
              type="button" title="ساخت دوباره‌ی کد" onClick={() => { setCodeEdited(false); }}
              style={{ ...primaryBtn, padding: '0 12px' }}
            ><RefreshCw size={14} /></button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 8 }}>
        <FieldLabel>تاریخ ورود به انبار</FieldLabel>
        <JalaliDateFields value={date} onChange={setDate} />
      </div>

      <FieldLabel>یادداشت (اختیاری)</FieldLabel>
      <input value={note} onChange={(e) => setNote(e.target.value)} style={{ ...inputStyle, width: '100%', marginBottom: 10 }} />

      {error && <div style={{ color: COLORS.expense, fontSize: 12, marginBottom: 8 }}>{error}</div>}
      <button type="submit" style={{ ...primaryBtn, width: '100%', justifyContent: 'center' }}>
        <Plus size={15} /> {matched ? 'ثبت ورود کالا' : 'افزودن کالا'}
      </button>
    </form>
  );
}
