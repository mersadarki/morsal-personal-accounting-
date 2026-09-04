import { COLORS } from '../../lib/constants';
import { subTabStyle } from '../../lib/ui.jsx';
import DailySalesView from './DailySalesView';
import InventoryView from './InventoryView';
import ShopSettingsView from './ShopSettingsView';
import ShopStatsView from './ShopStatsView';

export default function ShopView({
  shopTab, setShopTab,
  products, sales, archives, shopSettings,
  onAddProduct, onRestockProduct, onEditProduct, onDeleteProduct,
  onAddSale, onDeleteSale,
  onAddArchive, onDeleteArchive,
  onUpdateShopSettings,
}) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 4, background: '#fff', border: `1px solid ${COLORS.line}`, padding: 4, borderRadius: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <button onClick={() => setShopTab('daily')} style={{ ...subTabStyle(shopTab === 'daily'), flex: 1 }}>فروش روزانه</button>
        <button onClick={() => setShopTab('phones')} style={{ ...subTabStyle(shopTab === 'phones'), flex: 1 }}>انبار گوشی</button>
        <button onClick={() => setShopTab('accessories')} style={{ ...subTabStyle(shopTab === 'accessories'), flex: 1 }}>لوازم جانبی</button>
        <button onClick={() => setShopTab('stats')} style={{ ...subTabStyle(shopTab === 'stats'), flex: 1 }}>آمار</button>
        <button onClick={() => setShopTab('settings')} style={{ ...subTabStyle(shopTab === 'settings'), flex: 1 }}>تنظیمات</button>
      </div>

      {shopTab === 'daily' && (
        <DailySalesView products={products} sales={sales} onAddSale={onAddSale} onDeleteSale={onDeleteSale} />
      )}
      {shopTab === 'phones' && (
        <InventoryView category="phone" products={products} shopSettings={shopSettings} onAddNew={onAddProduct} onRestock={onRestockProduct} onEdit={onEditProduct} onDelete={onDeleteProduct} />
      )}
      {shopTab === 'accessories' && (
        <InventoryView category="accessory" products={products} shopSettings={shopSettings} onAddNew={onAddProduct} onRestock={onRestockProduct} onEdit={onEditProduct} onDelete={onDeleteProduct} />
      )}
      {shopTab === 'stats' && (
        <ShopStatsView sales={sales} archives={archives} onAddArchive={onAddArchive} onDeleteArchive={onDeleteArchive} onDeleteSale={onDeleteSale} />
      )}
      {shopTab === 'settings' && <ShopSettingsView shopSettings={shopSettings} onUpdate={onUpdateShopSettings} />}
    </div>
  );
}
