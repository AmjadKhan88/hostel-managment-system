import { describe, it, expect } from 'vitest';
import { renderInvoicePdf, renderReceiptPdf } from './documents.js';

const hostel = {
  name: 'Shaheen Hostel',
  address: { line1: 'Main Road', city: 'Peshawar', country: 'Pakistan' },
  currency: 'PKR',
  timezone: 'Asia/Karachi',
  paymentMethods: [
    {
      type: 'jazzcash',
      label: 'JazzCash',
      accountName: 'Shaheen Hostel',
      accountNumber: '03001234567',
      isActive: true,
    },
  ],
};
const resident = {
  name: 'Ali Khan',
  registrationNumber: 'REG-1',
  phone: '+920000000',
  email: 'ali@example.com',
};

const invoice = (overrides = {}) => ({
  invoiceNumber: 'INV-2026-000001',
  items: [{ description: 'Monthly rent', feeType: 'rent', amountMinorUnits: 1500000 }],
  totalMinorUnits: 1500000,
  paidMinorUnits: 0,
  status: 'issued',
  dueDate: new Date('2026-10-20'),
  issuedAt: new Date('2026-10-10'),
  notes: '',
  ...overrides,
});

const payment = (overrides = {}) => ({
  receiptNumber: 'RCPT-2026-000001',
  amountMinorUnits: 500000,
  method: 'jazzcash',
  status: 'completed',
  paidAt: new Date('2026-10-12'),
  notes: '',
  ...overrides,
});

const isPdf = (buffer) =>
  buffer.subarray(0, 5).toString() === '%PDF-' && buffer.subarray(-8).toString().includes('%%EOF');

describe('renderInvoicePdf', () => {
  it('renders an unpaid invoice with the how-to-pay block', async () => {
    expect(isPdf(await renderInvoicePdf({ hostel, resident, invoice: invoice() }))).toBe(true);
  });

  it('renders paid, partially paid and void invoices, with payments', async () => {
    for (const status of ['paid', 'partially_paid', 'void']) {
      const buffer = await renderInvoicePdf({
        hostel,
        resident,
        invoice: invoice({ status, paidMinorUnits: status === 'paid' ? 1500000 : 500000 }),
        payments: [payment(), payment({ receiptNumber: 'RCPT-2', status: 'refunded' })],
      });
      expect(isPdf(buffer)).toBe(true);
    }
  });

  it('paginates a long invoice instead of overflowing', async () => {
    const items = Array.from({ length: 80 }, (_, i) => ({
      description: `Charge number ${i + 1} with a reasonably long description of what it covers`,
      feeType: 'other',
      amountMinorUnits: 1000,
    }));
    const short = await renderInvoicePdf({ hostel, resident, invoice: invoice(), compress: false });
    const long = await renderInvoicePdf({
      hostel,
      resident,
      invoice: invoice({ items }),
      compress: false,
    });

    expect(isPdf(long)).toBe(true);
    expect(long.length).toBeGreaterThan(short.length * 2);
  });

  it('survives non-Latin names, a missing resident and a bad currency code', async () => {
    const buffer = await renderInvoicePdf({
      hostel: { ...hostel, currency: 'XXXX' },
      resident: { ...resident, name: 'علی خان' },
      invoice: invoice({ notes: 'نوٹ' }),
    });
    expect(isPdf(buffer)).toBe(true);
    expect(isPdf(await renderInvoicePdf({ hostel, resident: null, invoice: invoice() }))).toBe(
      true
    );
  });
});

describe('renderReceiptPdf', () => {
  it('renders a completed receipt', async () => {
    expect(
      isPdf(
        await renderReceiptPdf({
          hostel,
          resident,
          invoice: invoice({ paidMinorUnits: 500000 }),
          payment: payment(),
        })
      )
    ).toBe(true);
  });

  it('renders a refunded receipt, and one whose invoice no longer exists', async () => {
    const refunded = payment({
      status: 'refunded',
      refundedAt: new Date('2026-10-13'),
      refundReason: 'Paid twice',
    });
    expect(
      isPdf(await renderReceiptPdf({ hostel, resident, invoice: invoice(), payment: refunded }))
    ).toBe(true);
    expect(
      isPdf(await renderReceiptPdf({ hostel, resident, invoice: null, payment: payment() }))
    ).toBe(true);
  });
});
