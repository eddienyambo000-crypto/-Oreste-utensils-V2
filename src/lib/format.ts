const rwfFormatter = new Intl.NumberFormat("en-RW", {
  maximumFractionDigits: 0,
});

/** Formats 450000 → "450,000 RWF". */
export function formatRwf(amount: number): string {
  return `${rwfFormatter.format(amount)} RWF`;
}

/** Formats a phone for display without leaking formatting concerns elsewhere. */
export function formatPhone(phone: string): string {
  return phone.replace(/(\+?250)(\d{3})(\d{3})(\d{3})/, "$1 $2 $3 $4");
}
