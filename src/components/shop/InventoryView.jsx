import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { COLORS, SHOP_CATEGORY_LABELS } from '../../lib/constants';
import { toFaDigits } from '../../lib/format';
import { inputStyle } from '../../lib/ui.jsx';
import ProductForm from './ProductForm';
import ProductCard from './ProductCard';

export default function InventoryView({ category, products, shopSettings, onAddNew, onRestock, onEdit, onDelete }) {
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const prefix = category === 'phone' ? shopSettings.phonePrefix : shopSettings.accessoryPrefix;

  const categoryProducts = useMemo(() => products.filter((p) => p.category === category), [products, category]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? categoryProducts.filter((p) => p.name.toLowerCase().includes(q) || (p.code || '').toLowerCase().includes(q))
      : categoryProducts;
    return list.slice().sort((a, b) => b.updatedAt - a.updatedAt);
  }, [categoryProducts, search]);

  const totalStock = categoryProducts.reduce((s, p) => s + (p.stock || 0), 0);
  const totalValue = categoryProducts.reduce((s, p) => s + (p.stock || 0) * (p.purchasePrice || 0), 0);

  return (
    <div>
      <ProductForm category={category} products={products} prefix={prefix} cipherKey={shopSettings.cipherKey} onAddNew={onAddNew} onRestock={onRestock} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1, background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: COLORS.inkLight }}>تعداد کالا</div>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{toFaDigits(categoryProducts.length)}</div>
        </div>
        <div style={{ flex: 1, background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: COLORS.inkLight }}>جمع موجودی</div>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{toFaDigits(totalStock)}</div>
        </div>
        <div style={{ flex: 1, background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: COLORS.inkLight }}>ارزش خرید انبار</div>
          <div style={{ fontSize: 13, fontWeight: 800 }}>{toFaDigits(totalValue)}</div>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: 10 }}>
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={`جستجو در ${SHOP_CATEGORY_LABELS[category]}‌ها (اسم یا کد)...`}
          style={{ ...inputStyle, width: '100%', paddingRight: 32 }}
        />
        <Search size={15} color={COLORS.inkLight} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }} />
      </div>

      <div style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12, overflow: 'hidden' }}>
        {filtered.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: COLORS.inkLight, fontSize: 13 }}>
            {categoryProducts.length === 0 ? `هنوز ${SHOP_CATEGORY_LABELS[category]}‌ای ثبت نشده.` : 'موردی پیدا نشد.'}
          </div>
        )}
        {filtered.map((p) => (
          <ProductCard
            key={p.id} product={p} cipherKey={shopSettings.cipherKey}
            confirmDeleteId={confirmDeleteId} setConfirmDeleteId={setConfirmDeleteId}
            onEdit={onEdit} onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
