/** Formats integer minor units (paisa/cents) as e.g. "Rs 15,000.00" for plain-text messages and PDFs. */
export function formatMoney(minorUnits, currency = 'PKR') {
  const code = currency || 'PKR';
  const amount = (minorUnits ?? 0) / 100;
  try {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency: code })
      .format(amount)
      .replace(/\u00a0/g, ' ');
  } catch {
    return `${code} ${amount.toFixed(2)}`;
  }
}
