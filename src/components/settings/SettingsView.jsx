import { Download, Upload } from 'lucide-react';
import { COLORS } from '../../lib/constants';
import { primaryBtn, secondaryBtn } from '../../lib/ui.jsx';
import SettingsSection from './SettingsSection';
import BalancesSection from './BalancesSection';
import UpdateSection from './UpdateSection';

export default function SettingsView({
  onDownloadBackup, onRestoreBackup, backupMsg, backupFileRef,
  onExportExcel,
  onImportNeda, importMsg1, nedaFileRef,
  onImportGeneral, importMsg2, genFileRef,
  balances, onAddBalance, onEditBalance, confirmDeleteBal, setConfirmDeleteBal, onDeleteBalance,
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
          یک فایل شامل همه تراکنش‌ها، موجودی‌ها و ماه جاری می‌گیرد؛ برای بازیابی همون فایل رو دوباره وارد کنید.
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={onDownloadBackup} style={primaryBtn}><Download size={15} /> دانلود پشتیبان</button>
          <label style={{ ...secondaryBtn, cursor: 'pointer' }}>
            <Upload size={15} /> بازیابی از پشتیبان
            <input ref={backupFileRef} type="file" accept=".json" onChange={onRestoreBackup} style={{ display: 'none' }} />
          </label>
        </div>
        {backupMsg && <div style={{ marginTop: 8, fontSize: 12, color: COLORS.inkLight }}>{backupMsg}</div>}
      </SettingsSection>

      <SettingsSection title="خروجی اکسل">
        <div style={{ fontSize: 11.5, color: COLORS.inkLight, marginBottom: 10 }}>یک فایل اکسل قابل مشاهده از همه تراکنش‌ها و موجودی‌ها می‌سازد.</div>
        <button onClick={onExportExcel} style={secondaryBtn}><Download size={15} /> خروجی اکسل</button>
      </SettingsSection>

      <SettingsSection title="ورود اکسل هزینه‌های ندا">
        <div style={{ fontSize: 11.5, color: COLORS.inkLight, marginBottom: 10, lineHeight: 2 }}>
          ستون‌ها: <b>ماه</b>، روز، <b>عنوان</b>، حساب (ملی/ویپاد/اعتبار ملی/نقدی/دلار)، <b>مبلغ</b>
        </div>
        <label style={{ ...secondaryBtn, cursor: 'pointer', display: 'inline-flex' }}>
          <Upload size={15} /> انتخاب فایل
          <input ref={nedaFileRef} type="file" accept=".xlsx,.xls" onChange={onImportNeda} style={{ display: 'none' }} />
        </label>
        {importMsg1 && <div style={{ marginTop: 8, fontSize: 12, color: COLORS.inkLight }}>{importMsg1}</div>}
      </SettingsSection>

      <SettingsSection title="ورود اکسل هزینه و درآمد">
        <div style={{ fontSize: 11.5, color: COLORS.inkLight, marginBottom: 10, lineHeight: 2 }}>
          ستون‌ها: <b>ماه</b>، روز، <b>نوع</b> (هزینه/درآمد)، دسته (برای درآمد: وی‌پی‌ان/کاپیتان/خدمات/جابجایی)، عنوان، حساب، <b>مبلغ</b>
        </div>
        <label style={{ ...secondaryBtn, cursor: 'pointer', display: 'inline-flex' }}>
          <Upload size={15} /> انتخاب فایل
          <input ref={genFileRef} type="file" accept=".xlsx,.xls" onChange={onImportGeneral} style={{ display: 'none' }} />
        </label>
        {importMsg2 && <div style={{ marginTop: 8, fontSize: 12, color: COLORS.inkLight }}>{importMsg2}</div>}
      </SettingsSection>

      <BalancesSection
        balances={balances} onAddNew={onAddBalance} onEdit={onEditBalance}
        confirmDeleteBal={confirmDeleteBal} setConfirmDeleteBal={setConfirmDeleteBal} onDelete={onDeleteBalance}
      />
    </div>
  );
}
