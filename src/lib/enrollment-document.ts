// Reject malformed ZIP containers and oversized expanded documents before Word parsing.
export function isEnrollmentDocument(bytes: Buffer): boolean {
  if (
    bytes.length < 22 ||
    bytes.length > 4 * 1024 * 1024 ||
    bytes.readUInt32LE(0) !== 0x04034b50
  )
    return false;
  let end = bytes.length - 22;
  while (
    end >= Math.max(0, bytes.length - 65557) &&
    bytes.readUInt32LE(end) !== 0x06054b50
  )
    end--;
  if (end < 0 || bytes.readUInt32LE(end) !== 0x06054b50) return false;
  const count = bytes.readUInt16LE(end + 10);
  let offset = bytes.readUInt32LE(end + 16);
  if (count === 0 || count > 1000) return false;
  let size = 0;
  let hasDocument = false;
  for (let i = 0; i < count; i++) {
    if (offset + 46 > end || bytes.readUInt32LE(offset) !== 0x02014b50)
      return false;
    size += bytes.readUInt32LE(offset + 24);
    if (size > 30 * 1024 * 1024 || bytes.readUInt16LE(offset + 8) & 1)
      return false;
    const length = bytes.readUInt16LE(offset + 28);
    const next =
      offset +
      46 +
      length +
      bytes.readUInt16LE(offset + 30) +
      bytes.readUInt16LE(offset + 32);
    if (next > end) return false;
    const name = bytes.toString("utf8", offset + 46, offset + 46 + length);
    if (/vbaProject\.bin$/i.test(name)) return false;
    if (name === "word/document.xml") hasDocument = true;
    offset = next;
  }
  return hasDocument;
}
