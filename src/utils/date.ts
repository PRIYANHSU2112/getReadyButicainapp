// "DD/MM/YYYY" (as typed in forms) → ISO string, or null if invalid.
export const dmyToIso = (dmy: string): string | null => {
  const m = dmy.trim().match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m.map(Number);
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCMonth() === mo - 1 && date.getUTCDate() === d ? date.toISOString() : null;
};
