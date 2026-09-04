// Shared parsing/normalization for the two bulk-import paths (Excel sheet,
// OCR'd photo text) into either destination schema (shop archive rows,
// ledger tx rows). Both paths end up as the same shape — an array of
// string-cell rows — so they can share one column-mapping + preview UI.
import { MONTHS } from './constants';
import { monthInfo, parseMoneyShorthand, toEnglishDigits, toFaDigits } from './format';

// Splits free text (OCR output, or pasted text) into rows of cells. OCR/
// notebook tables rarely use a single consistent delimiter, so this
// accepts the common ones: tab, 2+ spaces, a "|" column rule, or a comma
// followed by a digit/space (not a thousands-separator comma).
export function splitTextIntoRows(text) {
  return (text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => line.split(/\t|\s{2,}|\s*\|\s*/).map((c) => c.trim()).filter((c) => c !== ''));
}

function matchMonth(text) {
  const t = toEnglishDigits(text).trim();
  const n = parseInt(t, 10);
  if (!isNaN(n) && n >= 1 && n <= 12 && /^\d+$/.test(t)) return n;
  const idx = MONTHS.findIndex((m) => text.indexOf(m) > -1 || m.indexOf(text) > -1);
  return idx > -1 ? idx + 1 : null;
}

function matchEnum(text, options) {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  return options.find((o) => {
    if (o.value.toLowerCase() === t) return true;
    if (o.label.toLowerCase() === t) return true;
    return (o.aliases || []).some((a) => a.toLowerCase() === t);
  }) || options.find((o) => o.label.toLowerCase().indexOf(t) > -1 || t.indexOf(o.label.toLowerCase()) > -1) || null;
}

// Normalizes one raw cell string against a schema field definition.
// Returns { value, valid, text } — `value` is the usable typed value (or
// null when unrecognized), `valid` says whether it's usable as-is,
// `text` is the raw string kept around for the editable preview cell.
export function normalizeCell(raw, field) {
  const text = raw == null ? '' : String(raw).trim();
  if (!text) return { value: field.type === 'text' ? '' : null, valid: !field.required, text };
  switch (field.type) {
    case 'amount': {
      const n = parseMoneyShorthand(text);
      return { value: isNaN(n) ? null : n, valid: !isNaN(n), text };
    }
    case 'int': {
      const n = parseInt(toEnglishDigits(text).replace(/[^0-9-]/g, ''), 10);
      return { value: isNaN(n) ? null : n, valid: !isNaN(n), text };
    }
    case 'year': {
      const n = parseInt(toEnglishDigits(text).replace(/[^0-9]/g, ''), 10);
      const ok = !isNaN(n) && n >= 1300 && n <= 1500;
      return { value: ok ? n : null, valid: ok, text };
    }
    case 'day': {
      const n = parseInt(toEnglishDigits(text).replace(/[^0-9]/g, ''), 10);
      const ok = !isNaN(n) && n >= 1 && n <= 31;
      return { value: ok ? n : null, valid: ok, text };
    }
    case 'month': {
      const idx = matchMonth(text);
      return { value: idx, valid: idx != null, text };
    }
    // Free-text "<month name> <year>" — same shape as every other month
    // label already used across the app (tx.m, installment entries, ...).
    case 'monthLabel': {
      const info = monthInfo(text);
      const ok = info.idx > -1 && !!info.year;
      const value = ok ? `${MONTHS[info.idx]} ${toFaDigits(parseInt(info.year, 10))}` : null;
      return { value, valid: ok, text };
    }
    case 'enum': {
      const opt = matchEnum(text, field.options);
      return { value: opt ? opt.value : null, valid: !!opt, text };
    }
    case 'text':
    default:
      return { value: text, valid: true, text };
  }
}

// Builds preview rows (one per source data row) from raw string rows + a
// {colIndex: fieldKey} mapping — each cell normalized per its target
// field's type, so the preview table can flag exactly what wasn't
// recognized instead of silently dropping or misreading it.
export function buildPreviewRows(rawRows, mapping, schema) {
  const fieldByKey = new Map(schema.map((f) => [f.key, f]));
  return rawRows.map((cells) => {
    const fields = {};
    Object.entries(mapping).forEach(([colIndex, fieldKey]) => {
      if (!fieldKey) return;
      const field = fieldByKey.get(fieldKey);
      if (!field) return;
      fields[fieldKey] = normalizeCell(cells[colIndex], field);
    });
    schema.forEach((f) => { if (!(f.key in fields)) fields[f.key] = normalizeCell('', f); });
    return fields;
  });
}

export function rowIsValid(row, schema) {
  return schema.every((f) => !f.required || (row[f.key] && row[f.key].valid));
}
