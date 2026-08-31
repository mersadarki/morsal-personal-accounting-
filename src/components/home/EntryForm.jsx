import { TrendingDown, TrendingUp } from 'lucide-react';
import { ACCOUNTS, ACCOUNT_LABELS, INCOME_CATS, INCOME_CAT_LABELS, INCOME_QUICK, COLORS } from '../../lib/constants';
import { FieldLabel, AmountPreview, inputStyle, selectStyle, primaryBtn, secondaryBtn, typeToggle, quickBtn } from '../../lib/ui.jsx';
import { toFaDigits } from '../../lib/format';

const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);

export default function EntryForm({ form, setForm, formError, editingId, titleSuggestions, onSubmit, onCancelEdit }) {
  return (
    <form onSubmit={onSubmit} style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 14, marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button type="button" onClick={() => setForm((f) => ({ ...f, t: 'e' }))} style={typeToggle(form.t === 'e', COLORS.expense)}>
          <TrendingDown size={14} /> هزینه
        </button>
        <button type="button" onClick={() => setForm((f) => ({ ...f, t: 'i' }))} style={typeToggle(form.t === 'i', COLORS.income)}>
          <TrendingUp size={14} /> درآمد
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
        <div style={{ flex: 2 }}>
          <FieldLabel>مبلغ (هزار تومان — یا مثلاً ۵/۸۰۰ برای ۵ میلیون و ۸۰۰ هزار)</FieldLabel>
          <input autoFocus inputMode="decimal" value={form.a} onChange={(e) => setForm((f) => ({ ...f, a: e.target.value }))} placeholder="مثلاً: 1500" style={{ ...inputStyle, width: '100%' }} />
          <AmountPreview value={form.a} />
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel>روز</FieldLabel>
          <select value={form.dt} onChange={(e) => setForm((f) => ({ ...f, dt: e.target.value }))} style={{ ...selectStyle, width: '100%' }}>
            {dayOptions.map((d) => <option key={d} value={d}>{toFaDigits(d)}</option>)}
          </select>
        </div>
      </div>

      {form.t === 'i' && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {INCOME_QUICK.map((q) => (
            <button type="button" key={q.val} onClick={() => setForm((f) => ({ ...f, a: q.val }))} style={quickBtn}>{q.label}</button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <FieldLabel>{form.t === 'e' ? 'از کدام حساب' : 'به کدام حساب'}</FieldLabel>
          <select value={form.acc} onChange={(e) => setForm((f) => ({ ...f, acc: e.target.value }))} style={{ ...selectStyle, width: '100%' }}>
            {ACCOUNTS.map((a) => <option key={a} value={a}>{ACCOUNT_LABELS[a]}</option>)}
          </select>
        </div>
        {form.t === 'i' && (
          <div style={{ flex: 1 }}>
            <FieldLabel>دسته درآمد</FieldLabel>
            <select value={form.cat} onChange={(e) => setForm((f) => ({ ...f, cat: e.target.value }))} style={{ ...selectStyle, width: '100%' }}>
              {INCOME_CATS.map((c) => <option key={c} value={c}>{INCOME_CAT_LABELS[c]}</option>)}
            </select>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 14, marginBottom: 10, flexWrap: 'wrap' }}>
        {form.t === 'e' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" checked={form.neda} onChange={(e) => setForm((f) => ({ ...f, neda: e.target.checked }))} />
            N
          </label>
        )}
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12.5 }}>
          <input type="checkbox" checked={form.transfer} onChange={(e) => setForm((f) => ({ ...f, transfer: e.target.checked, loan: e.target.checked ? false : f.loan }))} />
          جابجایی — نه هزینه نه درآمد، فقط موجودی حساب رو تغییر بده
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12.5 }}>
          <input type="checkbox" checked={form.loan} onChange={(e) => setForm((f) => ({ ...f, loan: e.target.checked, transfer: e.target.checked ? false : f.transfer }))} />
          قرض — نه هزینه نه درآمد، فقط موجودی حساب رو تغییر بده
        </label>
      </div>
      {form.t === 'e' && (
        <>
          <FieldLabel>{form.neda ? 'عنوان هزینه ندا (مثلاً: بیمارستان، کارگر)' : 'عنوان (اختیاری — مثلاً: قسط، جابجایی)'}</FieldLabel>
          <input list="titleSuggestions" value={form.ti} onChange={(e) => setForm((f) => ({ ...f, ti: e.target.value }))} placeholder="عنوان..." style={{ ...inputStyle, width: '100%', marginBottom: 10 }} />
          <datalist id="titleSuggestions">
            {titleSuggestions.map((t) => <option key={t} value={t} />)}
          </datalist>
        </>
      )}

      {formError && <div style={{ color: COLORS.expense, fontSize: 12, marginBottom: 8 }}>{formError}</div>}
      <button type="submit" style={{ ...primaryBtn, width: '100%', justifyContent: 'center', padding: '10px 0' }}>
        {editingId != null ? 'ذخیره تغییرات' : 'ثبت'}
      </button>
      {editingId != null && (
        <button type="button" onClick={onCancelEdit} style={{ ...secondaryBtn, width: '100%', justifyContent: 'center', marginTop: 8 }}>انصراف از ویرایش</button>
      )}
    </form>
  );
}
