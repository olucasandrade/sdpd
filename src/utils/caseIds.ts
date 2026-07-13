export function caseIdForNumber(n: number): string {
  return `case-${String(n).padStart(2, '0')}`;
}
