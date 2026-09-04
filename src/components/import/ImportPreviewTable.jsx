import { AlertCircle, Check } from 'lucide-react';
import { COLORS } from '../../lib/constants';
import { toFaDigits } from '../../lib/format';
import { rowIsValid } from '../../lib/importParse';
import { primaryBtn } from '../../lib/ui.jsx';

// Every source row lands here editable, cell by cell — a cell the parser
// couldn't make sense of is outlined in red instead of silently dropped
// or guessed at, and stays that way (blocking import) until it's fixed by
// hand or the whole row is checked off as skipped.
export default function ImportPreviewTable({ rows, schema, skipped, setSkipped, onEditCell, onImport, importLabel }) {
  const includedCount = rows.reduce((n, _, i) => (skipped.has(i) ? n : n + 1), 0);
  const blockingCount = rows.reduce((n, r, i) => (!skipped.has(i) && !rowIsValid(r, schema) ? n + 1 : n), 0);
  const canImport = includedCount > 0 && blockingCount === 0;

  function toggleSkip(i) {
    setSkipped((prev) => { const next = new Set(prev); if (next.has(i)) next.delete(i); else next.add(i); return next; });
  }

  return (
    <div>
      <div style={{ overflowX: 'auto', border: `1px solid ${COLORS.line}`, borderRadius: 10, marginBottom: 10 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12 }}>
          <thead>
            <tr style={{ background: COLORS.paperDark }}>
              <th style={{ padding: '6px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>رد شدن</th>
              {schema.map((f) => (
                <th key={f.key} style={{ padding: '6px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>{f.label}{f.required ? ' *' : ''}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isSkipped = skipped.has(i);
              return (
                <tr key={i} style={{ background: isSkipped ? COLORS.paperDark : '#fff', opacity: isSkipped ? 0.55 : 1 }}>
                  <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                    <input type="checkbox" checked={isSkipped} onChange={() => toggleSkip(i)} />
                  </td>
                  {schema.map((f) => {
                    const cell = row[f.key] || { text: '', valid: !f.required };
                    const bad = f.required && !cell.valid && !isSkipped;
                    return (
                      <td key={f.key} style={{ padding: '3px 5px' }}>
                        <input
                          value={cell.text} disabled={isSkipped}
                          onChange={(e) => onEditCell(i, f.key, e.target.value)}
                          style={{
                            width: 90, fontSize: 12, padding: '4px 6px', borderRadius: 5, fontFamily: 'inherit',
                            border: `1.5px solid ${bad ? COLORS.expense : COLORS.line}`,
                            background: bad ? COLORS.expenseBg : '#fff', color: COLORS.ink,
                          }}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: blockingCount > 0 ? COLORS.expense : COLORS.inkLight, marginBottom: 10 }}>
        {blockingCount > 0 ? <AlertCircle size={14} /> : <Check size={14} />}
        {blockingCount > 0
          ? `${toFaDigits(blockingCount)} ردیف هنوز فیلد اجباری ناقص داره — یا درستش کن یا با «رد شدن» از وارد کردن خارجش کن.`
          : `${toFaDigits(includedCount)} ردیف آماده‌ی وارد کردنه.`}
      </div>

      <button type="button" onClick={onImport} disabled={!canImport} style={{ ...primaryBtn, width: '100%', justifyContent: 'center', opacity: canImport ? 1 : 0.5, cursor: canImport ? 'pointer' : 'not-allowed' }}>
        {importLabel || `وارد کردن (${toFaDigits(includedCount)} ردیف)`}
      </button>
    </div>
  );
}
