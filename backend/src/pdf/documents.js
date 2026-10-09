import PDFDocument from 'pdfkit';
import { isValidTimeZone } from '../utils/timezone.js';

const COLORS = {
  ink: '#0F172A',
  muted: '#64748B',
  line: '#E2E8F0',
  brand: '#2F6FED',
  success: '#12A150',
  danger: '#D92D4A',
  warning: '#B45309',
  panel: '#F1F5F9',
};

const METHOD_LABELS = {
  cash: 'Cash',
  bank_transfer: 'Bank transfer',
  card: 'Card',
  mobile_wallet: 'Mobile wallet',
  jazzcash: 'JazzCash',
  easypaisa: 'EasyPaisa',
  other: 'Other',
};

const STATUS_STYLE = {
  issued: { label: 'Unpaid', color: COLORS.warning },
  partially_paid: { label: 'Partially paid', color: COLORS.warning },
  paid: { label: 'Paid', color: COLORS.success },
  void: { label: 'Void', color: COLORS.danger },
};

// PDF's built-in fonts only cover Latin-1. Anything else would print as the
// wrong glyph, so it shows as "?" — a visible, honest limitation. (Urdu or
// Arabic names need an embedded Unicode font; see the notes after the code.)
const safe = (value) => String(value ?? '').replace(/[^\x20-\x7E\xA0-\xFF]/g, '?');
const methodLabel = (method) => METHOD_LABELS[method] ?? safe(method);

function money(minorUnits, currency) {
  try {
    return new Intl.NumberFormat('en-PK', { style: 'currency', currency })
      .format((minorUnits ?? 0) / 100)
      .replace(/\u00a0/g, ' ');
  } catch {
    return `${currency} ${((minorUnits ?? 0) / 100).toFixed(2)}`;
  }
}

const zone = (hostel) => (isValidTimeZone(hostel?.timezone) ? hostel.timezone : 'UTC');

function fmtDate(date, timeZone) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone,
  });
}

function fmtDateTime(date, timeZone) {
  if (!date) return '-';
  return new Date(date).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  });
}

function newDoc(title, compress) {
  return new PDFDocument({
    size: 'A4',
    margin: 50,
    bufferPages: true,
    compress,
    info: { Title: safe(title), Producer: 'Hostel Management System' },
  });
}

function ensureSpace(doc, y, needed) {
  if (y + needed > doc.page.height - doc.page.margins.bottom - 50) {
    doc.addPage();
    return doc.page.margins.top;
  }
  return y;
}

function drawHeader(doc, { hostel, logo, title, number }) {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  let textX = left;

  if (logo) {
    try {
      doc.image(logo, left, 50, { fit: [52, 52] });
      textX = left + 64;
    } catch {
      // Unreadable image — carry on without a logo.
    }
  }

  doc.font('Helvetica-Bold').fontSize(16).fillColor(COLORS.ink);
  doc.text(safe(hostel.name), textX, 52, { width: 270 });

  const address = [
    hostel.address?.line1,
    hostel.address?.city,
    hostel.address?.state,
    hostel.address?.country,
  ]
    .filter(Boolean)
    .join(', ');
  if (address) {
    doc.font('Helvetica').fontSize(9).fillColor(COLORS.muted);
    doc.text(safe(address), textX, doc.y + 2, { width: 270 });
  }

  doc.font('Helvetica-Bold').fontSize(22).fillColor(COLORS.brand);
  doc.text(title, left, 50, { width: right - left, align: 'right', lineBreak: false });
  doc.font('Helvetica').fontSize(10).fillColor(COLORS.ink);
  doc.text(safe(number), left, 78, { width: right - left, align: 'right', lineBreak: false });

  doc.moveTo(left, 112).lineTo(right, 112).strokeColor(COLORS.line).lineWidth(1).stroke();
  return 128;
}

function labelValue(doc, label, value, x, y, width, color = COLORS.ink) {
  doc.font('Helvetica').fontSize(8).fillColor(COLORS.muted);
  doc.text(label.toUpperCase(), x, y, { width, lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(10.5).fillColor(color);
  const text = safe(value);
  doc.text(text, x, y + 12, { width });
  return y + 12 + doc.heightOfString(text, { width }) + 8;
}

function drawItemsTable(doc, items, currency, startY) {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const amountW = 100;
  const typeW = 90;
  const descW = right - left - amountW - typeW - 30;
  let y = startY;

  const drawHead = () => {
    doc.rect(left, y, right - left, 24).fill(COLORS.panel);
    doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.muted);
    doc.text('DESCRIPTION', left + 10, y + 8, { width: descW, lineBreak: false });
    doc.text('TYPE', left + 10 + descW + 10, y + 8, { width: typeW, lineBreak: false });
    doc.text('AMOUNT', right - amountW - 10, y + 8, {
      width: amountW,
      align: 'right',
      lineBreak: false,
    });
    y += 24;
  };

  drawHead();
  for (const item of items) {
    const description = safe(item.description);
    doc.font('Helvetica').fontSize(10);
    const rowHeight = Math.max(doc.heightOfString(description, { width: descW }), 12) + 14;

    if (y + rowHeight > doc.page.height - doc.page.margins.bottom - 50) {
      doc.addPage();
      y = doc.page.margins.top;
      drawHead();
    }

    doc.font('Helvetica').fontSize(10).fillColor(COLORS.ink);
    doc.text(description, left + 10, y + 7, { width: descW });
    doc.fontSize(9).fillColor(COLORS.muted);
    doc.text(safe(String(item.feeType ?? '').replace(/_/g, ' ')), left + 10 + descW + 10, y + 8, {
      width: typeW,
      lineBreak: false,
    });
    doc.fontSize(10).fillColor(COLORS.ink);
    doc.text(money(item.amountMinorUnits, currency), right - amountW - 10, y + 7, {
      width: amountW,
      align: 'right',
      lineBreak: false,
    });
    doc
      .moveTo(left, y + rowHeight)
      .lineTo(right, y + rowHeight)
      .strokeColor(COLORS.line)
      .lineWidth(0.5)
      .stroke();
    y += rowHeight;
  }
  return y;
}

function drawTotals(doc, rows, startY) {
  const right = doc.page.width - doc.page.margins.right;
  const boxW = 250;
  const x = right - boxW;
  let y = startY;

  for (const row of rows) {
    if (row.bold) {
      doc
        .moveTo(x, y - 4)
        .lineTo(right, y - 4)
        .strokeColor(COLORS.line)
        .lineWidth(1)
        .stroke();
    }
    doc.font(row.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(row.bold ? 12 : 10);
    doc
      .fillColor(row.bold ? COLORS.ink : COLORS.muted)
      .text(row.label, x, y, { width: boxW / 2, lineBreak: false });
    doc.fillColor(row.color ?? COLORS.ink).text(row.value, x + boxW / 2, y, {
      width: boxW / 2,
      align: 'right',
      lineBreak: false,
    });
    y += row.bold ? 26 : 18;
  }
  return y;
}

function drawPaymentsTable(doc, payments, currency, timeZone, startY) {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  let y = ensureSpace(doc, startY, 70);

  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor(COLORS.ink)
    .text('Payments received', left, y, { lineBreak: false });
  y += 22;

  doc.rect(left, y, right - left, 20).fill(COLORS.panel);
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLORS.muted);
  doc.text('RECEIPT', left + 10, y + 6, { lineBreak: false });
  doc.text('DATE', left + 150, y + 6, { lineBreak: false });
  doc.text('METHOD', left + 270, y + 6, { lineBreak: false });
  doc.text('AMOUNT', right - 110, y + 6, { width: 100, align: 'right', lineBreak: false });
  y += 20;

  for (const payment of payments) {
    y = ensureSpace(doc, y, 22);
    const refunded = payment.status === 'refunded';
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(refunded ? COLORS.muted : COLORS.ink);
    doc.text(safe(payment.receiptNumber), left + 10, y + 6, { lineBreak: false });
    doc.text(fmtDate(payment.paidAt, timeZone), left + 150, y + 6, { lineBreak: false });
    doc.text(methodLabel(payment.method), left + 270, y + 6, { lineBreak: false });
    doc.fillColor(refunded ? COLORS.danger : COLORS.ink);
    doc.text(
      `${money(payment.amountMinorUnits, currency)}${refunded ? ' (refunded)' : ''}`,
      right - 160,
      y + 6,
      {
        width: 150,
        align: 'right',
        lineBreak: false,
      }
    );
    doc
      .moveTo(left, y + 22)
      .lineTo(right, y + 22)
      .strokeColor(COLORS.line)
      .lineWidth(0.5)
      .stroke();
    y += 22;
  }
  return y;
}

function drawHowToPay(doc, methods, startY) {
  const left = doc.page.margins.left;
  let y = ensureSpace(doc, startY, 50 + methods.length * 34);

  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor(COLORS.ink)
    .text('How to pay', left, y, { lineBreak: false });
  y += 20;

  for (const method of methods) {
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLORS.ink);
    doc.text(`${safe(method.label)} (${methodLabel(method.type)})`, left, y, { lineBreak: false });
    const detail = [method.accountName, method.accountNumber, method.bankName]
      .filter(Boolean)
      .map(safe)
      .join('  |  ');
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(COLORS.muted)
      .text(detail, left, y + 13, { lineBreak: false });
    y += 32;
  }

  doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.muted);
  doc.text(
    'After paying, upload your payment screenshot in the Resident Portal so staff can verify it. The invoice is marked paid once staff approve it.',
    left,
    y,
    { width: doc.page.width - left - doc.page.margins.right }
  );
  return doc.y + 10;
}

function finish(doc, { watermark, timeZone }) {
  const range = doc.bufferedPageRange();
  const left = doc.page.margins.left;
  const width = doc.page.width - left - doc.page.margins.right;

  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    // Writing inside the bottom margin would make PDFKit add a new page,
    // so the margin is zeroed while the footer and watermark are drawn.
    const bottomMargin = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;

    if (watermark) {
      const cx = doc.page.width / 2;
      const cy = doc.page.height / 2;
      doc.save();
      doc.rotate(-35, { origin: [cx, cy] });
      doc.fillColor(watermark.color).opacity(0.08).font('Helvetica-Bold').fontSize(110);
      doc.text(watermark.text, 0, cy - 60, {
        width: doc.page.width,
        align: 'center',
        lineBreak: false,
      });
      doc.restore();
    }

    doc.font('Helvetica').fontSize(8).fillColor(COLORS.muted);
    doc.text(`Generated ${fmtDateTime(new Date(), timeZone)}`, left, doc.page.height - 40, {
      width,
      align: 'left',
      lineBreak: false,
    });
    doc.text(`Page ${i + 1} of ${range.count}`, left, doc.page.height - 40, {
      width,
      align: 'right',
      lineBreak: false,
    });

    doc.page.margins.bottom = bottomMargin;
  }

  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
}

export async function renderInvoicePdf({
  hostel,
  resident,
  invoice,
  payments = [],
  logo = null,
  compress,
}) {
  const timeZone = zone(hostel);
  const currency = hostel.currency || 'PKR';
  const doc = newDoc(`Invoice ${invoice.invoiceNumber}`, compress);
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const status = STATUS_STYLE[invoice.status] ?? STATUS_STYLE.issued;
  const isVoid = invoice.status === 'void';
  const total = invoice.totalMinorUnits ?? 0;
  const paid = invoice.paidMinorUnits ?? 0;
  const balance = total - paid;

  let y = drawHeader(doc, { hostel, logo, title: 'INVOICE', number: invoice.invoiceNumber });

  let leftY = labelValue(doc, 'Billed to', resident?.name ?? 'Unknown resident', left, y, 250);
  if (resident?.registrationNumber) {
    leftY = labelValue(doc, 'Registration no.', resident.registrationNumber, left, leftY, 250);
  }
  const contact = [resident?.phone, resident?.email].filter(Boolean).join('  |  ');
  if (contact) leftY = labelValue(doc, 'Contact', contact, left, leftY, 250);

  const metaX = left + 290;
  let metaY = labelValue(
    doc,
    'Issue date',
    fmtDate(invoice.issuedAt ?? invoice.createdAt, timeZone),
    metaX,
    y,
    205
  );
  metaY = labelValue(doc, 'Due date', fmtDate(invoice.dueDate, timeZone), metaX, metaY, 205);
  metaY = labelValue(doc, 'Status', status.label, metaX, metaY, 205, status.color);

  y = Math.max(leftY, metaY) + 10;
  y = drawItemsTable(doc, invoice.items ?? [], currency, y);

  y = ensureSpace(doc, y + 14, 90);
  y = drawTotals(
    doc,
    isVoid
      ? [
          {
            label: 'Total (voided)',
            value: money(total, currency),
            bold: true,
            color: COLORS.muted,
          },
        ]
      : [
          { label: 'Total', value: money(total, currency) },
          { label: 'Paid', value: money(paid, currency), color: COLORS.success },
          {
            label: 'Balance due',
            value: money(balance, currency),
            bold: true,
            color: balance > 0 ? COLORS.danger : COLORS.success,
          },
        ],
    y
  );

  if (payments.length > 0) y = drawPaymentsTable(doc, payments, currency, timeZone, y + 18);

  const methods = (hostel.paymentMethods ?? []).filter((m) => m.isActive);
  if (!isVoid && balance > 0 && methods.length > 0) y = drawHowToPay(doc, methods, y + 18);

  if (invoice.notes) {
    y = ensureSpace(doc, y + 14, 50);
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(COLORS.muted)
      .text('NOTES', left, y, { lineBreak: false });
    doc
      .font('Helvetica')
      .fontSize(9.5)
      .fillColor(COLORS.ink)
      .text(safe(invoice.notes), left, y + 13, { width: right - left });
  }

  let watermark = null;
  if (isVoid) watermark = { text: 'VOID', color: COLORS.danger };
  else if (invoice.status === 'paid') watermark = { text: 'PAID', color: COLORS.success };

  return finish(doc, { watermark, timeZone });
}

export async function renderReceiptPdf({
  hostel,
  resident,
  invoice,
  payment,
  logo = null,
  compress,
}) {
  const timeZone = zone(hostel);
  const currency = hostel.currency || 'PKR';
  const doc = newDoc(`Receipt ${payment.receiptNumber}`, compress);
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const refunded = payment.status === 'refunded';

  let y = drawHeader(doc, { hostel, logo, title: 'RECEIPT', number: payment.receiptNumber });

  doc.roundedRect(left, y, right - left, 74, 8).fillAndStroke('#F8FAFC', COLORS.line);
  doc.font('Helvetica').fontSize(8).fillColor(COLORS.muted);
  doc.text('AMOUNT RECEIVED', left + 18, y + 14, { lineBreak: false });
  doc
    .font('Helvetica-Bold')
    .fontSize(26)
    .fillColor(refunded ? COLORS.muted : COLORS.success);
  doc.text(money(payment.amountMinorUnits, currency), left + 18, y + 30, { lineBreak: false });
  y += 96;

  let leftY = labelValue(doc, 'Received from', resident?.name ?? 'Unknown resident', left, y, 250);
  if (resident?.registrationNumber) {
    leftY = labelValue(doc, 'Registration no.', resident.registrationNumber, left, leftY, 250);
  }
  leftY = labelValue(doc, 'Applied to invoice', invoice?.invoiceNumber ?? '-', left, leftY, 250);

  const metaX = left + 290;
  let metaY = labelValue(doc, 'Payment date', fmtDateTime(payment.paidAt, timeZone), metaX, y, 205);
  metaY = labelValue(doc, 'Payment method', methodLabel(payment.method), metaX, metaY, 205);
  if (payment.notes) metaY = labelValue(doc, 'Reference / notes', payment.notes, metaX, metaY, 205);

  y = Math.max(leftY, metaY) + 6;

  if (invoice) {
    y = ensureSpace(doc, y, 90);
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor(COLORS.ink)
      .text('Invoice summary (as of today)', left, y, {
        lineBreak: false,
      });
    const balance = invoice.totalMinorUnits - invoice.paidMinorUnits;
    y = drawTotals(
      doc,
      [
        { label: 'Invoice total', value: money(invoice.totalMinorUnits, currency) },
        {
          label: 'Paid to date',
          value: money(invoice.paidMinorUnits, currency),
          color: COLORS.success,
        },
        {
          label: 'Balance',
          value: money(balance, currency),
          bold: true,
          color: balance > 0 ? COLORS.danger : COLORS.success,
        },
      ],
      y + 22
    );
  }

  if (refunded) {
    y = ensureSpace(doc, y + 14, 60);
    doc.font('Helvetica-Bold').fontSize(10).fillColor(COLORS.danger);
    doc.text(`Refunded on ${fmtDate(payment.refundedAt, timeZone)}`, left, y, { lineBreak: false });
    if (payment.refundReason) {
      doc.font('Helvetica').fontSize(9.5).fillColor(COLORS.ink);
      doc.text(`Reason: ${safe(payment.refundReason)}`, left, y + 15, { width: right - left });
    }
    y = doc.y + 8;
  }

  y = ensureSpace(doc, y + 20, 30);
  doc.font('Helvetica').fontSize(8.5).fillColor(COLORS.muted);
  doc.text('This is a computer-generated receipt and does not require a signature.', left, y, {
    width: right - left,
    align: 'center',
  });

  return finish(doc, {
    watermark: refunded ? { text: 'REFUNDED', color: COLORS.danger } : null,
    timeZone,
  });
}
