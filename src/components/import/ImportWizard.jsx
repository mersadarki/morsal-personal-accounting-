import { useState } from 'react';
import { Camera, FileSpreadsheet } from 'lucide-react';
import { COLORS } from '../../lib/constants';
import { useImportPipeline } from '../../lib/useImportPipeline';
import { primaryBtn, secondaryBtn, subTabStyle } from '../../lib/ui.jsx';
import ColumnMapper from './ColumnMapper';
import ExcelUpload from './ExcelUpload';
import ImportPreviewTable from './ImportPreviewTable';
import PhotoOCRUpload from './PhotoOCRUpload';

// Generic upload → map columns → edit/confirm preview → import pipeline,
// shared by every bulk-import destination (shop archive stats, ledger
// tx) and both sources (an Excel sheet, an OCR'd photo) — only the
// schema and the final onImport callback differ per destination.
export default function ImportWizard({ schema, onImport, description }) {
  const [source, setSource] = useState('excel');
  const [step, setStep] = useState('upload');
  const [doneMsg, setDoneMsg] = useState('');
  const pipeline = useImportPipeline(schema);

  function handleParsed(rawRows) {
    pipeline.loadRawRows(rawRows);
    setDoneMsg('');
    setStep('map');
  }

  function goPreview() {
    pipeline.buildRows();
    setStep('preview');
  }

  function handleImport() {
    const included = pipeline.rows.filter((_, i) => !pipeline.skipped.has(i));
    const records = included.map((row) => {
      const rec = {};
      schema.forEach((f) => { rec[f.key] = row[f.key] ? row[f.key].value : null; });
      return rec;
    });
    onImport(records);
    setDoneMsg(`${records.length} ردیف وارد شد.`);
    pipeline.reset();
    setStep('upload');
  }

  function startOver() {
    pipeline.reset();
    setDoneMsg('');
    setStep('upload');
  }

  return (
    <div style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
      {description && <div style={{ fontSize: 11.5, color: COLORS.inkLight, marginBottom: 10, lineHeight: 1.9 }}>{description}</div>}

      {step === 'upload' && (
        <>
          <div style={{ display: 'flex', gap: 4, background: COLORS.paperDark, padding: 4, borderRadius: 10, marginBottom: 12 }}>
            <button type="button" onClick={() => setSource('excel')} style={{ ...subTabStyle(source === 'excel'), flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <FileSpreadsheet size={13} /> فایل اکسل
            </button>
            <button type="button" onClick={() => setSource('photo')} style={{ ...subTabStyle(source === 'photo'), flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <Camera size={13} /> عکس
            </button>
          </div>
          {source === 'excel' ? <ExcelUpload onParsed={handleParsed} /> : <PhotoOCRUpload onParsed={handleParsed} />}
          {doneMsg && <div style={{ fontSize: 12, color: COLORS.income, marginTop: 10 }}>{doneMsg}</div>}
        </>
      )}

      {step === 'map' && pipeline.rawRows && (
        <>
          <ColumnMapper
            rawRows={pipeline.rawRows} schema={schema} mapping={pipeline.mapping} setMapping={pipeline.setMapping}
            hasHeaderRow={pipeline.hasHeaderRow} setHasHeaderRow={pipeline.setHasHeaderRow}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="button" onClick={goPreview} style={primaryBtn}>ادامه به پیش‌نمایش</button>
            <button type="button" onClick={startOver} style={secondaryBtn}>انصراف</button>
          </div>
        </>
      )}

      {step === 'preview' && (
        <>
          <ImportPreviewTable
            rows={pipeline.rows} schema={schema} skipped={pipeline.skipped} setSkipped={pipeline.setSkipped}
            onEditCell={pipeline.editCell} onImport={handleImport}
          />
          <button type="button" onClick={() => setStep('map')} style={{ ...secondaryBtn, marginTop: 8 }}>برگشت به تنظیم ستون‌ها</button>
        </>
      )}
    </div>
  );
}
