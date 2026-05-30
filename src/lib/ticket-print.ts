import { jsPDF } from 'jspdf';

export interface TicketPrintItem {
  cantidad: number;
  nombre_producto?: string;
  nota?: string;
  precio_unitario?: number;
  subtotal?: number;
}

export interface TicketPrintOrder {
  numero_orden: string | number;
  tipo_orden?: string;
  nombre_cliente?: string;
  apellido_cliente?: string;
  mesa_numero?: number | null;
  total: number;
  detalles?: TicketPrintItem[];
}

export interface TicketPrintPayload {
  order: TicketPrintOrder;
  metodoPago?: string;
  titulo?: string;
}

function formatCurrency(value: number): string {
  return `$${Number(value ?? 0).toFixed(2)}`;
}

function cleanFileName(value: string): string {
  return value.replace(/[^a-zA-Z0-9-_]/g, '_');
}

function formatNumber(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : '0.00';
}

type InvoiceLine = {
  qty: number;
  desc: string;
  note?: string;
  unitPrice?: number;
  subtotal?: number;
};

function buildInvoiceLines(order: TicketPrintOrder): InvoiceLine[] {
  const detalles = order.detalles ?? [];
  if (detalles.length === 0) return [];

  return detalles.map((item) => ({
    qty: Number(item.cantidad ?? 0),
    desc: item.nombre_producto ?? 'Producto',
    note: item.nota,
    unitPrice: Number.isFinite(item.precio_unitario) ? Number(item.precio_unitario) : undefined,
    subtotal: Number.isFinite(item.subtotal) ? Number(item.subtotal) : undefined,
  }));
}

export function printTicket({ order, metodoPago, titulo = 'Ticket de venta' }: TicketPrintPayload): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const cliente = `${order.nombre_cliente ?? ''} ${order.apellido_cliente ?? ''}`.trim();
  const detalles = buildInvoiceLines(order);
  const total = Number(order.total ?? 0);

  const margin = 14;
  const maxWidth = 210 - (margin * 2);
  let y = 14;

  // Encabezado
  doc.setDrawColor(230);
  doc.rect(margin, y, maxWidth, 24);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(titulo, margin + 3, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('BiteBoss', margin + 3, y + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.text('Documento', margin + maxWidth - 48, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Orden: #${order.numero_orden}`, margin + maxWidth - 48, y + 14);
  doc.text(`Fecha: ${new Date().toLocaleString('es-ES')}`, margin + maxWidth - 48, y + 19);
  y += 30;

  // Datos del cliente
  doc.setDrawColor(235);
  doc.rect(margin, y, maxWidth, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('Datos del cliente', margin + 3, y + 6.2);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Cliente: ${cliente || '—'}`, margin + 3, y + 11.7);
  doc.text(`Tipo de orden: ${order.tipo_orden ?? '—'}`, margin + 3, y + 16.7);
  doc.text(`Mesa: ${order.mesa_numero ? `Mesa ${order.mesa_numero}` : '—'}`, margin + 78, y + 16.7);
  doc.text(`Metodo de pago: ${metodoPago ?? '—'}`, margin + 125, y + 16.7);
  y += 24;

  // Tabla de detalle
  const colQty = margin + 3;
  const colDesc = margin + 21;
  const colUnit = margin + maxWidth - 50;
  const colSubtotal = margin + maxWidth - 22;

  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y, maxWidth, 8, 'F');
  doc.setDrawColor(220);
  doc.rect(margin, y, maxWidth, 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('Cant.', colQty, y + 5.3);
  doc.text('Descripcion', colDesc, y + 5.3);
  doc.text('P.Unit', colUnit, y + 5.3, { align: 'right' });
  doc.text('Subtotal', colSubtotal, y + 5.3, { align: 'right' });
  y += 8;

  if (detalles.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text('Sin detalle de productos', margin + 3, y + 6);
    y += 9;
  } else {
    for (const item of detalles) {
      const descLines = doc.splitTextToSize(item.desc, colUnit - colDesc - 3);
      const noteLines = item.note ? doc.splitTextToSize(`Nota: ${item.note}`, colUnit - colDesc - 3) : [];
      const blockHeight = Math.max(6, (descLines.length + noteLines.length) * 4.4 + 2);

      // salto de pagina si no cabe
      if (y + blockHeight + 34 > 285) {
        doc.addPage();
        y = 16;
      }

      doc.setDrawColor(235);
      doc.rect(margin, y, maxWidth, blockHeight);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.text(String(item.qty), colQty, y + 4.8);
      doc.text(descLines, colDesc, y + 4.8);
      doc.text(item.unitPrice === undefined ? '-' : formatNumber(item.unitPrice), colUnit, y + 4.8, { align: 'right' });
      doc.text(item.subtotal === undefined ? '-' : formatNumber(item.subtotal), colSubtotal, y + 4.8, { align: 'right' });

      if (noteLines.length > 0) {
        doc.setFontSize(8.5);
        doc.setTextColor(90);
        doc.text(noteLines, colDesc, y + 4.8 + (descLines.length * 4.4));
        doc.setTextColor(0);
      }

      y += blockHeight;
    }
  }

  y += 6;

  // Total
  const totalsX = margin + maxWidth - 70;
  doc.setDrawColor(220);
  doc.rect(totalsX, y, 70, 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('Total:', totalsX + 3, y + 8);
  doc.text(formatCurrency(total), totalsX + 67, y + 8, { align: 'right' });
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  const footerText = doc.splitTextToSize(
    `${titulo} generado automaticamente por BiteBoss con informacion disponible del pedido.`,
    maxWidth,
  );
  doc.text(footerText, margin, y);

  const fileName = cleanFileName(`ticket_${order.numero_orden}_${Date.now()}.pdf`);
  doc.save(fileName);
}
