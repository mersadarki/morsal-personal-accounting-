import { Download, Upload } from 'lucide-react';
import { COLORS } from '../../lib/constants';
import { LEDGER_TX_IMPORT_SCHEMA } from '../../lib/importSchemas';
import { primaryBtn, secondaryBtn } from '../../lib/ui.jsx';
import ImportWizard from '../import/ImportWizard';
import SettingsSection from './SettingsSection';
import UpdateSection from './UpdateSection';

export default function SettingsView({
  onDownloadBackup, onRestoreBackup, backupMsg, backupFileRef,
  onExportOwnExpenses, onExportNedaExpenses, onExportDebts, onExportInstallments, onExportAllExcel,
  onImportTx,
  update,
}) {
  return (
    <div>
      <UpdateSection
        needRefresh={update.needRefresh} checking={update.checking} lastCheck={update.lastCheck}
        lastApplied={update.lastApplied} buildTime={update.buildTime} onCheck={update.checkForUpdate} onApply={update.applyUpdate}
      />

      <SettingsSection title="پشتیبان‌گیری کامل">
        <div style={{ fontSize: 11.5, color: COLORS.inkLight, marginBottom: 10, lineHeight: 2 }}>
          یک فایل شامل همه‌ی اطلاعات برنامه (تراکنش‌ها، موجودی‌ها، بدهی‌ها، اقساط و ماه جاری) می‌گیرد — اگه گوشی از دست بره یا عوض بشه، با همین فایل همه‌چیز برمی‌گرده.
          خود برنامه هم چیزی نیست که با گوشی از بین بره: همیشه از آدرس زیر در دسترسه، کافیه اون رو یه جایی (نوت، ایمیل) براتون ذخیره باشه.
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={onDownloadBackup} style={primaryBtn}><Download size={15} /> دانلود پشتیبان کامل</button>
          <label style={{ ...secondaryBtn, cursor: 'pointer' }}>
            <Upload size={15} /> بازیابی از پشتیبان
            <input ref={backupFileRef} type="file" accept=".json" onChange={onRestoreBackup} style={{ display: 'none' }} />
          </label>
        </div>
        {backupMsg && <div style={{ marginTop: 8, fontSize: 12, color: COLORS.inkLight }}>{backupMsg}</div>}
      </SettingsSection>

      <SettingsSection title="درون‌ریزی هزینه/درآمد از سال‌های قبل">
        <ImportWizard
          schema={LEDGER_TX_IMPORT_SCHEMA} onImport={onImportTx}
          description="تراکنش‌های قدیمی که تا الان اکسلی یا روی کاغذ بودن رو یک‌جا وارد کن — از فایل اکسل یا از عکس. موجودی حساب فعلی دست‌نخورده می‌مونه، این فقط ردیف‌های هزینه/درآمد رو برای همون ماهی که مشخص می‌کنی اضافه می‌کنه."
        />
      </SettingsSection>

      <SettingsSection title="خروجی اکسل">
        <div style={{ fontSize: 11.5, color: COLORS.inkLight, marginBottom: 10 }}>برای مشاهده/اشتراک‌گذاری، نه بازیابی.</div>
        <button onClick={onExportAllExcel} style={{ ...primaryBtn, width: '100%', justifyContent: 'center', marginBottom: 10 }}>
          <Download size={15} /> دانلود همه (یک فایل، ۴ شیت جدا)
        </button>
        <div style={{ fontSize: 11, color: COLORS.inkLight, marginBottom: 6 }}>یا هرکدوم به‌صورت فایل جدا:</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap', overflowX: 'auto' }}>
          <button onClick={onExportOwnExpenses} aria-label="خروجی اکسل هزینه خودم" style={{ ...secondaryBtn, padding: '7px 8px', fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}><Download size={13} /> هزینه خودم</button>
          <button onClick={onExportNedaExpenses} aria-label="خروجی اکسل هزینه ندا" style={{ ...secondaryBtn, padding: '7px 8px', fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}><Download size={13} /> هزینه ندا</button>
          <button onClick={onExportDebts} aria-label="خروجی اکسل بدهی" style={{ ...secondaryBtn, padding: '7px 8px', fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}><Download size={13} /> بدهی</button>
          <button onClick={onExportInstallments} aria-label="خروجی اکسل قسط" style={{ ...secondaryBtn, padding: '7px 8px', fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}><Download size={13} /> قسط</button>
        </div>
      </SettingsSection>
    </div>
  );
}
