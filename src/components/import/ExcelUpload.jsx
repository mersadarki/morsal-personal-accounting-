import { useState } from 'react';
import { Upload } from 'lucide-react';
import { COLORS } from '../../lib/constants';
import { secondaryBtn } from '../../lib/ui.jsx';

export default function ExcelUpload({ onParsed }) {
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  async function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setFileName(file.name);
    try {
      const XLSX = await import('xlsx');
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' })
        .map((r) => r.map((c) => (c == null ? '' : String(c))))
        .filter((r) => r.some((c) => c.trim() !== ''));
      if (rows.length === 0) { setError('فایل خالیه یا قابل خوندن نیست.'); return; }
      onParsed(rows);
    } catch {
      setError('خوندن فایل اکسل با خطا مواجه شد.');
    }
  }

  return (
    <div>
      <label style={{ ...secondaryBtn, cursor: 'pointer', display: 'inline-flex' }}>
        <Upload size={15} /> انتخاب فایل اکسل (xlsx / csv)
        <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} style={{ display: 'none' }} />
      </label>
      {fileName && <div style={{ fontSize: 11.5, color: COLORS.inkLight, marginTop: 6 }}>{fileName}</div>}
      {error && <div style={{ fontSize: 11.5, color: COLORS.expense, marginTop: 6 }}>{error}</div>}
    </div>
  );
}
