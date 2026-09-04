import { useState } from 'react';
import { buildPreviewRows, normalizeCell } from './importParse';

// Shared state machine behind both bulk-import paths (Excel sheet, OCR'd
// photo text) and both destinations (shop archive rows, ledger tx rows):
// raw string rows come in from whichever source, get mapped onto the
// target schema by column, turn into an editable preview, and only the
// rows the user leaves un-skipped and valid ever reach the caller.
export function useImportPipeline(schema) {
  const [rawRows, setRawRows] = useState(null);
  const [hasHeaderRow, setHasHeaderRow] = useState(true);
  const [mapping, setMapping] = useState({});
  const [rows, setRows] = useState([]);
  const [skipped, setSkipped] = useState(new Set());

  function loadRawRows(newRawRows) {
    setRawRows(newRawRows);
    setHasHeaderRow(true);
    setMapping({});
    setRows([]);
    setSkipped(new Set());
  }

  function buildRows() {
    const dataRows = hasHeaderRow ? rawRows.slice(1) : rawRows;
    setRows(buildPreviewRows(dataRows, mapping, schema));
    setSkipped(new Set());
  }

  function editCell(rowIndex, fieldKey, text) {
    const field = schema.find((f) => f.key === fieldKey);
    setRows((prev) => prev.map((r, i) => (i === rowIndex ? { ...r, [fieldKey]: normalizeCell(text, field) } : r)));
  }

  function reset() {
    setRawRows(null); setHasHeaderRow(true); setMapping({}); setRows([]); setSkipped(new Set());
  }

  return { rawRows, hasHeaderRow, setHasHeaderRow, mapping, setMapping, rows, skipped, setSkipped, loadRawRows, buildRows, editCell, reset };
}
