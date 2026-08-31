// Initial dataset used only on first run (before any data is saved on the
// device). Populate via Settings → «بازیابی از پشتیبان» or the Excel
// importers, or edit these constants before deploy.
export const SEED_TX = [];
export const SEED_BALANCES = {};

// Seeded from the user's handwritten notes. Amounts are best-effort parsed
// from shorthand +/- running tallies — verify against the notes below and
// adjust via the «بدهی» tab as needed.
export const SEED_DEBTS = [
  {
    id: 1,
    person: 'مامان',
    entries: [
      { id: 1, delta: 240000, note: 'مانده اولیه' },
      { id: 2, delta: 76000, note: '' },
      { id: 3, delta: -5800, note: '' },
      { id: 4, delta: -9000, note: '' },
      { id: 5, delta: 15000, note: 'شیشه ماشین داده (روز ۱۵)' },
      { id: 6, delta: -13000, note: '' },
      { id: 7, delta: -2000, note: '' },
    ],
  },
  {
    id: 2,
    person: 'ندا سوئد',
    entries: [
      { id: 1, delta: 26500, note: 'مانده اولیه' },
      { id: 2, delta: -2900, note: 'دادم' },
      { id: 3, delta: 3000, note: 'دست من داره' },
    ],
  },
  {
    id: 3,
    person: 'مرصاد',
    entries: [
      { id: 1, delta: 144000, note: 'تا آخر خرداد' },
      { id: 2, delta: 850, note: 'قرص' },
      { id: 3, delta: 2325, note: 'باشگاه' },
      { id: 4, delta: 1000, note: 'مربی' },
      { id: 5, delta: 0, note: '۳ غذا (مبلغ نامشخص — ویرایش کنید)' },
      { id: 6, delta: 1100, note: 'bcaa aakg' },
      { id: 7, delta: 1200, note: 'وی‌پی‌ان' },
      { id: 8, delta: 6900, note: 'گینر' },
      { id: 9, delta: 0, note: '۱ مربی (مبلغ نامشخص — ویرایش کنید)' },
      { id: 10, delta: 0, note: '۳ غذا (مبلغ نامشخص — ویرایش کنید)' },
      { id: 11, delta: 1200, note: 'وی‌پی‌ان' },
      { id: 12, delta: 2325, note: '' },
      { id: 13, delta: 200, note: 'وی‌پی‌ان استاد' },
      { id: 14, delta: 5000, note: 'اجاره' },
      { id: 15, delta: 3800, note: 'کلود' },
      { id: 16, delta: 4160, note: 'شهریور - گیفت' },
    ],
  },
];

// Payment-due schedules, no amounts (those show up as normal «قسط...»
// expense transactions when actually paid). Home screen reminds when a due
// date is today or tomorrow.
export const SEED_INSTALLMENTS = [
  {
    id: 1,
    name: 'ویپاد',
    amount: null,
    entries: [
      { id: 1, m: 'شهریور ۱۴۰۵', dt: 19, paid: false },
      { id: 2, m: 'مهر ۱۴۰۵', dt: 19, paid: false },
      { id: 3, m: 'آبان ۱۴۰۵', dt: 19, paid: false },
    ],
  },
  {
    id: 2,
    name: 'ملی',
    amount: null,
    entries: [
      { id: 1, m: 'مهر ۱۴۰۵', dt: 7, paid: false },
      { id: 2, m: 'آبان ۱۴۰۵', dt: 7, paid: false },
      { id: 3, m: 'آذر ۱۴۰۵', dt: 7, paid: false },
      { id: 4, m: 'دی ۱۴۰۵', dt: 7, paid: false },
      { id: 5, m: 'بهمن ۱۴۰۵', dt: 7, paid: false },
      { id: 6, m: 'اسفند ۱۴۰۵', dt: 7, paid: false },
      { id: 7, m: 'فروردین ۱۴۰۶', dt: 7, paid: false },
      { id: 8, m: 'اردیبهشت ۱۴۰۶', dt: 7, paid: false },
      { id: 9, m: 'خرداد ۱۴۰۶', dt: 7, paid: false },
      { id: 10, m: 'تیر ۱۴۰۶', dt: 7, paid: false },
    ],
  },
  {
    id: 3,
    name: 'های بانک',
    amount: null,
    entries: [
      { id: 1, m: 'مهر ۱۴۰۵', dt: 6, paid: false },
      { id: 2, m: 'آبان ۱۴۰۵', dt: 6, paid: false },
      { id: 3, m: 'آذر ۱۴۰۵', dt: 6, paid: false },
      { id: 4, m: 'دی ۱۴۰۵', dt: 6, paid: false },
    ],
  },
];
