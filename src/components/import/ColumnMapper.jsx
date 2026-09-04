import { COLORS } from '../../lib/constants';
import { FieldLabel, selectStyle } from '../../lib/ui.jsx';

const SKIP = '';

// One select per detected column — "این ستون چیه؟" — so a sheet or an
// OCR'd table (whose column order is never known in advance) gets mapped
// onto the target schema by hand, once, rather than guessed.
export default function ColumnMapper({ rawRows, schema, mapping, setMapping, hasHeaderRow, setHasHeaderRow }) {
  const colCount = rawRows.reduce((m, r) => Math.max(m, r.length), 0);
  const headerRow = hasHeaderRow ? rawRows[0] : null;
  const sampleRow = rawRows[hasHeaderRow ? 1 : 0] || [];

  function setCol(colIndex, fieldKey) {
    setMapping((prev) => ({ ...prev, [colIndex]: fieldKey || null }));
  }

  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12.5, marginBottom: 10 }}>
        <input type="checkbox" checked={hasHeaderRow} onChange={(e) => setHasHeaderRow(e.target.checked)} />
        ردیف اول عنوان ستون‌هاست (جزو داده حساب نشه)
      </label>
      <div style={{ display: 'grid', gap: 8 }}>
        {Array.from({ length: colCount }, (_, i) => i).map((col) => (
          <div key={col} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 9, padding: '8px 10px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: COLORS.inkLight }}>
                {headerRow && headerRow[col] ? headerRow[col] : `ستون ${col + 1}`}
              </div>
              <div style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                نمونه: {sampleRow[col] || '—'}
              </div>
            </div>
            <div style={{ width: 150, flexShrink: 0 }}>
              <select value={mapping[col] || SKIP} onChange={(e) => setCol(col, e.target.value)} style={{ ...selectStyle, width: '100%' }}>
                <option value={SKIP}>— نادیده بگیر —</option>
                {schema.map((f) => <option key={f.key} value={f.key}>{f.label}{f.required ? ' *' : ''}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: COLORS.inkLight, marginTop: 8 }}>
        <FieldLabel>* یعنی این فیلد اجباریه — باید حداقل یک ستون به هرکدوم از فیلدهای ستاره‌دار وصل بشه.</FieldLabel>
      </div>
    </div>
  );
}
