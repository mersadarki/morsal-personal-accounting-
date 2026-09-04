import { ACCOUNT_LABELS, ACCOUNTS, INCOME_CATS, INCOME_CAT_LABELS, SHOP_CATEGORY_LABELS } from './constants';

export const SHOP_ARCHIVE_IMPORT_SCHEMA = [
  { key: 'year', label: 'سال', type: 'year', required: true },
  { key: 'month', label: 'ماه (خالی = کل سال)', type: 'month', required: false },
  {
    key: 'category', label: 'دسته', type: 'enum', required: false,
    options: [
      { value: '', label: 'همه', aliases: ['all', 'both'] },
      { value: 'phone', label: SHOP_CATEGORY_LABELS.phone, aliases: ['phone', 'mobile'] },
      { value: 'accessory', label: SHOP_CATEGORY_LABELS.accessory, aliases: ['accessory', 'acc'] },
    ],
  },
  { key: 'totalSales', label: 'کل فروش', type: 'amount', required: true },
  { key: 'totalProfit', label: 'کل سود', type: 'amount', required: false },
  { key: 'qty', label: 'تعداد', type: 'int', required: false },
  { key: 'note', label: 'یادداشت', type: 'text', required: false },
];

export const LEDGER_TX_IMPORT_SCHEMA = [
  {
    key: 'type', label: 'نوع', type: 'enum', required: true,
    options: [
      { value: 'e', label: 'هزینه', aliases: ['expense', 'cost', 'e'] },
      { value: 'i', label: 'درآمد', aliases: ['income', 'in', 'i'] },
    ],
  },
  { key: 'month', label: 'ماه (مثلاً: مهر ۱۴۰۵)', type: 'monthLabel', required: true },
  { key: 'day', label: 'روز', type: 'day', required: false },
  {
    key: 'account', label: 'حساب', type: 'enum', required: true,
    options: ACCOUNTS.map((a) => ({ value: a, label: ACCOUNT_LABELS[a], aliases: [a] })),
  },
  { key: 'amount', label: 'مبلغ', type: 'amount', required: true },
  { key: 'title', label: 'عنوان (فقط برای هزینه)', type: 'text', required: false },
  {
    key: 'incomeCat', label: 'دسته‌ی درآمد (فقط برای درآمد)', type: 'enum', required: false,
    options: INCOME_CATS.map((c) => ({ value: c, label: INCOME_CAT_LABELS[c], aliases: [c] })),
  },
  {
    key: 'neda', label: 'ندا؟', type: 'enum', required: false,
    options: [{ value: 'no', label: 'خیر', aliases: ['no', '0', ''] }, { value: 'yes', label: 'بله', aliases: ['yes', '1', 'n'] }],
  },
];
