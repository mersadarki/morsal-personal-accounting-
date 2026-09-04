// Classic retailer's "price cipher": a 10-unique-letter keyword whose
// position maps to a digit (0-9), used to hide a product's purchase price
// inside its code — e.g. with key "SOLARMIXED" (S=0 O=1 L=2 A=3 R=4 M=5
// I=6 X=7 E=8 D=9), a ۳٬۲۰۰ purchase price encodes as "ALSS". Anyone who
// knows the keyword can read the price straight off the tag; anyone who
// doesn't just sees letters.
export const DEFAULT_CIPHER_KEY = 'SOLARMIXED';

export function normalizeCipherKey(key) {
  return (key || '').toUpperCase().replace(/[^A-Z]/g, '');
}

export function isValidCipherKey(key) {
  const k = normalizeCipherKey(key);
  if (k.length !== 10) return false;
  return new Set(k.split('')).size === 10;
}

// Encodes a non-negative price (rounded to a whole number) into cipher
// letters. Returns '' when the key isn't valid or the price is empty.
export function encodePrice(price, key) {
  const k = normalizeCipherKey(key) || DEFAULT_CIPHER_KEY;
  if (!isValidCipherKey(k)) return '';
  const n = Math.round(Math.abs(price || 0));
  const digits = String(n);
  return digits.split('').map((d) => k[parseInt(d, 10)]).join('');
}

// Pulls the cipher segment out of a product code: everything after the
// last "-" (the convention used by buildProductCode), or the whole string
// when there's no separator — so decoding also works on a bare cipher
// snippet pasted on its own.
export function extractCipherSegment(code) {
  const raw = (code || '').trim();
  if (!raw) return '';
  const parts = raw.split('-');
  return parts[parts.length - 1];
}

// Decodes a product code (or a bare cipher segment) back into the
// purchase price it encodes. Returns null when the key is invalid or the
// segment contains a character outside the keyword (not a valid cipher).
export function decodePrice(code, key) {
  const k = normalizeCipherKey(key) || DEFAULT_CIPHER_KEY;
  if (!isValidCipherKey(k)) return null;
  const seg = normalizeCipherKey(extractCipherSegment(code));
  if (!seg) return null;
  let digits = '';
  for (const ch of seg) {
    const idx = k.indexOf(ch);
    if (idx === -1) return null;
    digits += String(idx);
  }
  return parseInt(digits, 10);
}

export function buildProductCode(prefix, seq, purchasePrice, key) {
  const num = String(seq).padStart(4, '0');
  const cipher = encodePrice(purchasePrice, key);
  return cipher ? `${prefix}${num}-${cipher}` : `${prefix}${num}`;
}

// Next free sequence number for a prefix, read off existing codes
// ("G0007-ALSS" -> 7) so a freshly-suggested code never collides.
export function nextSeqForPrefix(products, prefix) {
  let max = 0;
  (products || []).forEach((p) => {
    const code = (p.code || '').trim();
    if (!code.startsWith(prefix)) return;
    const m = code.slice(prefix.length).match(/^(\d+)/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return max + 1;
}
