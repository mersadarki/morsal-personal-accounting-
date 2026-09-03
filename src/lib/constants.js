export const COLORS = {
  cover: '#1C1B1A', coverLight: '#2A2826', paper: '#F3EFE8', paperDark: '#E8E1D4',
  ink: '#211F1C', inkLight: '#726b60', expense: '#A6402F', expenseBg: '#F2DCD4',
  income: '#3E8563', incomeBg: '#DDEEE4', brass: '#C08552', brassDark: '#9c6b3f', line: '#E3DCCF',
};

export const ACCOUNTS = ['ملی', 'ویپاد', 'اعتبار ملی', 'نقدی', 'دلار'];
export const ACCOUNT_LABELS = { 'ملی': 'بانک ملی', 'ویپاد': 'ویپاد', 'اعتبار ملی': 'اعتبار ملی', 'نقدی': 'نقدی', 'دلار': 'دلار' };
// One brand-ish color per account so a transaction/balance is identifiable
// by account at a glance (ملی's bank green vs. ویپاد's wallet orange, etc.)
// without reading the label text.
export const ACCOUNT_COLORS = {
  'ملی': '#0f6b3f', 'اعتبار ملی': '#0f6b3f', 'ویپاد': '#e07a1f', 'نقدی': COLORS.brassDark, 'دلار': '#1a7a6e',
};
export const INCOME_CATS = ['vpn', 'vpnNew', 'kapitan', 'khadamat', 'transfer'];
export const INCOME_CAT_LABELS = { vpn: 'وی‌پی‌ان', vpnNew: 'وی‌پی‌ان نیو', kapitan: 'کاپیتان', khadamat: 'خدمات', transfer: 'جابجایی (بدون درآمد واقعی)' };
export const MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
export const INCOME_QUICK = [{ label: '۵۰۰ هزار تومان', val: '500' }, { label: '۱ میلیون تومان', val: '1000' }];
