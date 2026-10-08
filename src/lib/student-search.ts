/** Accept a batch number or a label such as "Batch 2", matching the whole value. */
export function matchesStudentBatch(batchNumber: number, search: string) {
  if (!search.trim()) return true;
  const match = /^(?:batch\s*)?(\d+)$/i.exec(search.trim());
  return Boolean(match && Number(match[1]) === batchNumber);
}

export function matchesStudentSearch(student: {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  batch_number: number;
}, search: string) {
  const batchMatch = /\bbatch\s*(\d+)\b/i.exec(search);
  if (batchMatch && Number(batchMatch[1]) !== student.batch_number) return false;
  const query = (batchMatch ? search.replace(batchMatch[0], "") : search).trim().toLowerCase();
  const details = `${student.first_name ?? ""} ${student.last_name ?? ""} ${student.email ?? ""} ${student.phone ?? ""}`.toLowerCase();
  return details.includes(query);
}
