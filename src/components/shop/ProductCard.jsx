import { useState } from 'react';
import { Trash2, Check, X, ChevronDown, ChevronUp, KeyRound } from 'lucide-react';
import { COLORS, LOW_STOCK_THRESHOLD } from '../../lib/constants';
import { toFaDigits, parseMoneyShorthand } from '../../lib/format';
import { decodePrice } from '../../lib/priceCipher';
import { iconBtn, inputStyle, primaryBtn, secondaryBtn, FieldLabel, Amount } from '../../lib/ui.jsx';

export default function ProductCard({ product, cipherKey, confirmDeleteId, setConfirmDeleteId, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState(product.name);
  const [code, setCode] = useState(product.code || '');
  const [salePrice, setSalePrice] = useState(product.salePrice != null ? String(product.salePrice) : '');
  const [note, setNote] = useState(product.note || '');

  const decoded = code ? decodePrice(code, cipherKey) : null;
  const decodeMismatch = decoded != null && decoded !== product.purchasePrice;
  const lowStock = (product.stock || 0) <= LOW_STOCK_THRESHOLD;

  function saveEdit(e) {
    e.preventDefault();
    const sale = salePrice.trim() ? parseMoneyShorthand(salePrice) : null;
    onEdit(product.id, { name: name.trim() || product.name, code: code.trim(), salePrice: sale, note: note.trim() });
    setExpanded(false);
  }

  return (
    <div style={{ borderBottom: `1px solid ${COLORS.line}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
        <div style={{ width: 5, alignSelf: 'stretch', borderRadius: 3, background: lowStock ? COLORS.expense : COLORS.brass, flexShrink: 0 }} />
        <button onClick={() => setExpanded((v) => !v)} style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'right', padding: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
          <div style={{ fontSize: 11, color: COLORS.inkLight, fontFamily: 'monospace', direction: 'ltr', textAlign: 'right' }}>
            {product.code || 'بدون کد'}
          </div>
        </button>
        <div style={{ textAlign: 'left' }}>
          <div className="tabular" style={{ fontSize: 12.5, fontWeight: 700, color: lowStock ? COLORS.expense : COLORS.ink }}>
            {toFaDigits(product.stock || 0)} عدد
          </div>
          <div className="tabular" style={{ fontSize: 10.5, color: COLORS.inkLight }}><Amount value={product.purchasePrice} /></div>
        </div>
        <button onClick={() => setExpanded((v) => !v)} style={iconBtn(COLORS.inkLight)}>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {expanded && (
        <div style={{ padding: '0 12px 12px' }}>
          <form onSubmit={saveEdit} style={{ background: COLORS.paperDark, borderRadius: 10, padding: 10 }}>
            <FieldLabel>اسم کالا</FieldLabel>
            <input value={name} onChange={(e) => setName(e.target.value)} style={{ ...inputStyle, width: '100%', marginBottom: 8 }} />
            <FieldLabel>کد کالا</FieldLabel>
            <input value={code} onChange={(e) => setCode(e.target.value)} style={{ ...inputStyle, width: '100%', marginBottom: 4, fontFamily: 'monospace', direction: 'ltr', textAlign: 'left' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: decodeMismatch ? COLORS.expense : COLORS.inkLight, marginBottom: 8 }}>
              <KeyRound size={12} />
              {decoded == null ? 'رمز قیمت در کد پیدا نشد یا قابل خواندن نیست.' : decodeMismatch ? `رمز کد با قیمت خرید فعلی یکی نیست (رمز: ${toFaDigits(decoded)})` : `رمز قیمت خرید تأیید شد: ${toFaDigits(decoded)} هزار ت`}
            </div>
            <FieldLabel>قیمت فروش پیشنهادی</FieldLabel>
            <input value={salePrice} onChange={(e) => setSalePrice(e.target.value)} style={{ ...inputStyle, width: '100%', marginBottom: 8 }} />
            <FieldLabel>یادداشت</FieldLabel>
            <input value={note} onChange={(e) => setNote(e.target.value)} style={{ ...inputStyle, width: '100%', marginBottom: 10 }} />
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="submit" style={{ ...primaryBtn, flex: 1, justifyContent: 'center' }}>ذخیره</button>
              {confirmDeleteId === product.id ? (
                <>
                  <button type="button" onClick={() => onDelete(product.id)} style={iconBtn(COLORS.expense)}><Check size={15} /></button>
                  <button type="button" onClick={() => setConfirmDeleteId(null)} style={iconBtn(COLORS.inkLight)}><X size={15} /></button>
                </>
              ) : (
                <button type="button" onClick={() => setConfirmDeleteId(product.id)} style={{ ...secondaryBtn, color: COLORS.expense }}><Trash2 size={14} /></button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
