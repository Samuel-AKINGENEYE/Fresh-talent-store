import { jsPDF } from 'jspdf';

interface InvoiceItem {
  product_name: string;
  quantity: number;
  price: number;
}

interface InvoiceAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  sector?: string | null;
}

interface InvoiceOrder {
  order_number: string;
  created_at: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
}

export function generateInvoicePDF(
  order: InvoiceOrder,
  items: InvoiceItem[],
  address: InvoiceAddress,
  customerEmail?: string,
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Brand colours (RGB)
  const blue: [number, number, number] = [30, 64, 175];
  const orange: [number, number, number] = [249, 115, 22];
  const gray: [number, number, number] = [107, 114, 128];
  const lightGray: [number, number, number] = [243, 244, 246];

  // --- Header band ---
  doc.setFillColor(...blue);
  doc.rect(0, 0, pageW, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Fresh Talent Store', margin, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Tech. Fresh. For You.  ·  Kigali, Rwanda  ·  freshtalentstore.rw', margin, 24);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageW - margin, 16, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`#${order.order_number}`, pageW - margin, 24, { align: 'right' });

  y = 46;

  // --- Order meta row ---
  doc.setTextColor(...gray);
  doc.setFontSize(9);
  const dateStr = new Date(order.created_at).toLocaleDateString('en-RW', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  doc.text(`Date: ${dateStr}`, margin, y);
  doc.text(`Payment: ${order.payment_method.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`, pageW / 2, y, { align: 'center' });
  doc.text(`Status: ${order.payment_status.toUpperCase()}`, pageW - margin, y, { align: 'right' });

  y += 10;

  // --- Bill To ---
  doc.setFillColor(...lightGray);
  doc.roundedRect(margin, y, pageW - margin * 2, 28, 2, 2, 'F');
  y += 6;
  doc.setTextColor(...blue);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', margin + 4, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  y += 5;
  doc.text(address.full_name, margin + 4, y);
  y += 4;
  const addrLine = [
    address.address_line1,
    address.address_line2,
    address.sector,
    address.city,
  ].filter(Boolean).join(', ');
  doc.text(addrLine, margin + 4, y);
  y += 4;
  const contactLine = [address.phone, customerEmail].filter(Boolean).join('   ·   ');
  doc.setTextColor(...gray);
  doc.text(contactLine, margin + 4, y);

  y += 14;

  // --- Items table header ---
  doc.setFillColor(...blue);
  doc.rect(margin, y, pageW - margin * 2, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const col = { product: margin + 3, qty: pageW - 68, unit: pageW - 48, total: pageW - margin };
  doc.text('Product', col.product, y + 5.5);
  doc.text('Qty', col.qty, y + 5.5, { align: 'right' });
  doc.text('Unit Price', col.unit, y + 5.5, { align: 'right' });
  doc.text('Total', col.total, y + 5.5, { align: 'right' });
  y += 8;

  // --- Items rows ---
  doc.setFont('helvetica', 'normal');
  items.forEach((item, i) => {
    const rowH = 8;
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageW - margin * 2, rowH, 'F');
    }
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(9);
    // Truncate long product names
    const name = item.product_name.length > 45 ? item.product_name.slice(0, 42) + '…' : item.product_name;
    doc.text(name, col.product, y + 5.5);
    doc.text(String(item.quantity), col.qty, y + 5.5, { align: 'right' });
    doc.text(`RWF ${item.price.toLocaleString()}`, col.unit, y + 5.5, { align: 'right' });
    doc.text(`RWF ${(item.price * item.quantity).toLocaleString()}`, col.total, y + 5.5, { align: 'right' });
    y += rowH;
  });

  y += 4;

  // --- Totals ---
  const totalsX = pageW - margin - 60;
  const totalsLabelX = totalsX;
  const totalsValueX = pageW - margin;

  const addRow = (label: string, value: string, bold = false, colorRgb?: [number, number, number]) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(...(colorRgb ?? ([30, 30, 30] as [number, number, number])));
    doc.text(label, totalsLabelX, y);
    doc.text(value, totalsValueX, y, { align: 'right' });
    y += 6;
  };

  doc.setDrawColor(...lightGray);
  doc.line(totalsX - 2, y, pageW - margin, y);
  y += 4;

  addRow('Subtotal', `RWF ${order.subtotal.toLocaleString()}`);
  addRow('Delivery Fee', order.delivery_fee === 0 ? 'Free' : `RWF ${order.delivery_fee.toLocaleString()}`);
  if (order.discount > 0) {
    addRow('Discount', `- RWF ${order.discount.toLocaleString()}`, false, [22, 163, 74]);
  }

  y += 2;
  doc.setFillColor(...blue);
  doc.roundedRect(totalsX - 4, y - 4, pageW - margin - totalsX + 4 + margin, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', totalsLabelX, y + 3);
  doc.text(`RWF ${order.total.toLocaleString()}`, totalsValueX, y + 3, { align: 'right' });

  y += 18;

  // --- Thank-you footer ---
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...gray);
  doc.text('Thank you for shopping at Fresh Talent Store!', pageW / 2, y, { align: 'center' });
  y += 5;
  doc.setTextColor(...orange);
  doc.setFontSize(8);
  doc.text('Questions? WhatsApp us at +250 78X XXX XXX or email hello@freshtalentstore.rw', pageW / 2, y, { align: 'center' });

  // --- Page border accent ---
  doc.setDrawColor(...orange);
  doc.setLineWidth(1.5);
  doc.line(0, doc.internal.pageSize.getHeight() - 6, pageW, doc.internal.pageSize.getHeight() - 6);

  doc.save(`invoice_${order.order_number}.pdf`);
}
