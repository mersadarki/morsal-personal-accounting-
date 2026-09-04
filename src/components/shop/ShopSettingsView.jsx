import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { COLORS } from '../../lib/constants';
import { parseMoneyShorthand, toFaDigits } from '../../lib/format';
import { decodePrice, encodePrice, isValidCipherKey, normalizeCipherKey } from '../../lib/priceCipher';
import { AmountInput, AmountPreview, FieldLabel, inputStyle } from '../../lib/ui.jsx';
import SettingsSection from '../settings/SettingsSection';

export default function ShopSettingsView({ shopSettings, onUpdate }) {
  const [keyInput, setKeyInput] = useState(shopSettings.cipherKey);
  const [previewPrice, setPreviewPrice] = useState('');
  const [decodeInput, setDecodeInput] = useState('');

  const keyValid = isValidCipherKey(keyInput);
  const normalizedKey = normalizeCipherKey(keyInput);

  function saveKey() {
    if (!keyValid) return;
    onUpdate({ cipherKey: normalizedKey });
  }
  function savePrefix(field, value) {
    const v = (value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
    onUpdate({ [field]: v || 'G' });
  }

  const decoded = decodeInput.trim() ? decodePrice(decodeInput, shopSettings.cipherKey) : null;

  return (
    <div>
      <SettingsSection title="رمز قیمت خرید">
        <div style={{ fontSize: 11.5, color: COLORS.inkLight, marginBottom: 10, lineHeight: 1.9 }}>
          یک کلمه‌ی ۱۰ حرفی با حروف تکراری‌نشده — هر حرف جای یک رقم (۰ تا ۹) رو می‌گیره، به ترتیب جایگاهش در کلمه.
          قیمت خرید هر کالا با همین کلمه به حروف رمز می‌شه و آخر کد کالا (بعد از خط تیره) نوشته می‌شه — فقط کسی که کلمه رو بلده می‌تونه قیمت خرید رو از روی کد بخونه.
        </div>
        <FieldLabel>کلمه‌ی رمز (۱۰ حرف انگلیسی، بدون تکرار)</FieldLabel>
        <input
          value={keyInput} onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
          style={{ ...inputStyle, width: '100%', marginBottom: 6, fontFamily: 'monospace', direction: 'ltr', textAlign: 'left', letterSpacing: 2 }}
        />
        {!keyValid && <div style={{ color: COLORS.expense, fontSize: 11.5, marginBottom: 8 }}>باید دقیقاً ۱۰ حرف انگلیسی متفاوت باشه.</div>}
        {keyValid && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {normalizedKey.split('').map((ch, i) => (
              <div key={i} style={{ background: COLORS.paperDark, borderRadius: 6, padding: '3px 8px', fontSize: 11, fontFamily: 'monospace' }}>
                {ch} = {toFaDigits(i)}
              </div>
            ))}
          </div>
        )}
        <button
          type="button" onClick={saveKey} disabled={!keyValid || normalizedKey === shopSettings.cipherKey}
          style={{ background: COLORS.cover, color: COLORS.paper, border: 'none', borderRadius: 9, padding: '9px 14px', fontSize: 13, fontWeight: 600, cursor: keyValid ? 'pointer' : 'not-allowed', opacity: keyValid ? 1 : 0.5, fontFamily: 'Vazirmatn' }}
        >
          ذخیره‌ی کلمه‌ی رمز
        </button>
        {normalizedKey !== shopSettings.cipherKey && keyValid && (
          <div style={{ fontSize: 11, color: COLORS.expense, marginTop: 8 }}>
            توجه: عوض کردن کلمه‌ی رمز باعث می‌شه رمزِ کدهای قبلاً ساخته‌شده دیگه با این کلمه‌ی جدید جور در نیاد — کد خودِ کالاها تغییر نمی‌کنه، فقط دیگه نمی‌تونی رمزشون رو با کلمه‌ی جدید بخونی.
          </div>
        )}

        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${COLORS.line}` }}>
          <FieldLabel>آزمایش: یک قیمت خرید بزن، رمزش رو ببین</FieldLabel>
          <AmountInput value={previewPrice} onChange={(e) => setPreviewPrice(e.target.value)} />
          <AmountPreview value={previewPrice} />
          {previewPrice.trim() && keyValid && (
            <div style={{ marginTop: 6, fontSize: 13, fontFamily: 'monospace', direction: 'ltr', textAlign: 'left' }}>
              → {encodePrice(parseMoneyShorthand(previewPrice), normalizedKey) || '—'}
            </div>
          )}
        </div>
      </SettingsSection>

      <SettingsSection title="پیشوند کد کالا">
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <FieldLabel>پیشوند گوشی</FieldLabel>
            <input value={shopSettings.phonePrefix} onChange={(e) => savePrefix('phonePrefix', e.target.value)} style={{ ...inputStyle, width: '100%', fontFamily: 'monospace', direction: 'ltr', textAlign: 'left' }} />
          </div>
          <div style={{ flex: 1 }}>
            <FieldLabel>پیشوند لوازم جانبی</FieldLabel>
            <input value={shopSettings.accessoryPrefix} onChange={(e) => savePrefix('accessoryPrefix', e.target.value)} style={{ ...inputStyle, width: '100%', fontFamily: 'monospace', direction: 'ltr', textAlign: 'left' }} />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="رمزگشایی یک کد">
        <div style={{ fontSize: 11.5, color: COLORS.inkLight, marginBottom: 8 }}>کد کامل کالا یا فقط بخش رمزی بعد از خط تیره رو بچسبون.</div>
        <input
          value={decodeInput} onChange={(e) => setDecodeInput(e.target.value)}
          placeholder="مثلاً: G0007-ALSS" style={{ ...inputStyle, width: '100%', marginBottom: 8, fontFamily: 'monospace', direction: 'ltr', textAlign: 'left' }}
        />
        {decodeInput.trim() && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: decoded == null ? COLORS.expense : COLORS.income }}>
            <KeyRound size={14} />
            {decoded == null ? 'قابل خواندن نیست.' : `قیمت خرید: ${toFaDigits(decoded)} هزار تومان`}
          </div>
        )}
      </SettingsSection>
    </div>
  );
}
