import { useState } from 'react';
import { Camera, Images, Loader2, ScanText } from 'lucide-react';
import { COLORS } from '../../lib/constants';
import { splitTextIntoRows } from '../../lib/importParse';
import { inputStyle, primaryBtn, secondaryBtn } from '../../lib/ui.jsx';

const TESSERACT_STATUS_FA = {
  'loading tesseract core': 'در حال بارگذاری موتور تشخیص متن...',
  'initializing tesseract': 'در حال آماده‌سازی...',
  'loading language traineddata': 'در حال دانلود بسته‌ی زبان (بار اول نیاز به اینترنت داره)...',
  'initializing api': 'در حال آماده‌سازی...',
  'recognizing text': 'در حال خواندن متن عکس...',
};

// The photo itself never touches any persistent storage — it lives only
// as an in-memory object URL for the moment it's shown as a thumbnail and
// fed to the OCR engine; both the URL and the file reference are dropped
// right after recognition finishes (success or failure), so only the
// text it read — which you can still edit — survives past this step.
export default function PhotoOCRUpload({ onParsed }) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setError(''); setText(''); setBusy(true);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setStatus('در حال آماده‌سازی موتور تشخیص متن...');
    setProgress(0);
    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker(['fas', 'eng'], 1, {
        logger: (m) => {
          if (m.status) setStatus(TESSERACT_STATUS_FA[m.status] || m.status);
          if (typeof m.progress === 'number') setProgress(Math.round(m.progress * 100));
        },
      });
      const { data } = await worker.recognize(file);
      await worker.terminate();
      setText(data.text || '');
    } catch {
      setError('تشخیص متن روی این عکس با خطا مواجه شد — می‌تونی متن رو دستی هم تایپ کنی.');
    } finally {
      URL.revokeObjectURL(url);
      setPreviewUrl('');
      setStatus('');
      setBusy(false);
    }
  }

  function convert() {
    const rows = splitTextIntoRows(text);
    if (rows.length) onParsed(rows);
  }

  return (
    <div>
      <div style={{ fontSize: 11.5, color: COLORS.inkLight, marginBottom: 10, lineHeight: 1.9 }}>
        عکس فقط لحظه‌ای برای تشخیص متن استفاده می‌شه و هیچ‌جا ذخیره نمی‌مونه — فقط متنی که ازش خونده می‌شه باقی می‌مونه تا خودت تأییدش کنی. بار اول استفاده، بسته‌ی زبان (چند مگابایت) دانلود می‌شه؛ دفعات بعد سریع‌تره.
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <label style={{ ...secondaryBtn, cursor: busy ? 'default' : 'pointer', display: 'inline-flex', opacity: busy ? 0.6 : 1 }}>
          <Camera size={15} /> گرفتن عکس
          {/* capture="environment" opens the camera directly on mobile */}
          <input type="file" accept="image/*" capture="environment" onChange={handleFile} disabled={busy} style={{ display: 'none' }} />
        </label>
        <label style={{ ...secondaryBtn, cursor: busy ? 'default' : 'pointer', display: 'inline-flex', opacity: busy ? 0.6 : 1 }}>
          <Images size={15} /> انتخاب از گالری
          {/* no capture attribute — opens the normal file/photo picker */}
          <input type="file" accept="image/*" onChange={handleFile} disabled={busy} style={{ display: 'none' }} />
        </label>
      </div>

      {previewUrl && (
        <div style={{ marginTop: 8 }}>
          <img src={previewUrl} alt="" style={{ maxWidth: 140, maxHeight: 140, borderRadius: 8, border: `1px solid ${COLORS.line}`, display: 'block' }} />
        </div>
      )}
      {status && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: COLORS.inkLight, marginTop: 8 }}>
          <Loader2 size={14} className="animate-spin" /> {status}{progress > 0 ? ` (${progress}٪)` : ''}
        </div>
      )}
      {error && <div style={{ fontSize: 12, color: COLORS.expense, marginTop: 8 }}>{error}</div>}

      {(text || error) && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11.5, color: COLORS.inkLight, marginBottom: 6 }}>
            متن تشخیص داده‌شده — قبل از تبدیل به جدول، هرجا اشتباه خونده شده رو دستی درستش کن:
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} style={{ ...inputStyle, width: '100%', marginBottom: 8, fontFamily: 'inherit', resize: 'vertical' }} />
          <button type="button" onClick={convert} disabled={!text.trim()} style={{ ...primaryBtn, opacity: text.trim() ? 1 : 0.5 }}><ScanText size={15} /> تبدیل به جدول</button>
        </div>
      )}
    </div>
  );
}
