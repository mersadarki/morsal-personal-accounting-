import { X } from 'lucide-react';
import { ACCOUNTS, ACCOUNT_LABELS, COLORS } from '../../lib/constants';
import { FieldLabel, inputStyle, primaryBtn, iconBtn, displayStyle } from '../../lib/ui.jsx';

export default function BalanceFormModal({ balForm, setBalForm, balError, editingBalMonth, onSubmit, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(31,61,52,0.55)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 30 }} onClick={onClose}>
      <form onSubmit={onSubmit} onClick={(e) => e.stopPropagation()} style={{ background: COLORS.paper, width: '100%', maxWidth: 480, borderRadius: '16px 16px 0 0', padding: 20, maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ ...displayStyle, fontSize: 20, color: COLORS.cover }}>{editingBalMonth != null ? 'ویرایش موجودی ماه' : 'ثبت موجودی پایان ماه'}</div>
          <button type="button" onClick={onClose} style={iconBtn(COLORS.inkLight)}><X size={18} /></button>
        </div>
        <FieldLabel>ماه</FieldLabel>
        <input value={balForm.month} onChange={(e) => setBalForm((f) => ({ ...f, month: e.target.value }))} placeholder="مثلاً: مهر ۱۴۰۵" style={{ ...inputStyle, width: '100%', marginBottom: 10 }} />
        {ACCOUNTS.map((a) => (
          <div key={a}>
            <FieldLabel>{ACCOUNT_LABELS[a]} (هزار تومان)</FieldLabel>
            <input inputMode="decimal" value={balForm[a]} onChange={(e) => setBalForm((f) => ({ ...f, [a]: e.target.value }))} placeholder="0" style={{ ...inputStyle, width: '100%', marginBottom: 10 }} />
          </div>
        ))}
        {balError && <div style={{ color: COLORS.expense, fontSize: 12, marginBottom: 10 }}>{balError}</div>}
        <button type="submit" style={{ ...primaryBtn, width: '100%', justifyContent: 'center', padding: '11px 0' }}>
          {editingBalMonth != null ? 'ذخیره تغییرات' : 'ثبت'}
        </button>
      </form>
    </div>
  );
}
