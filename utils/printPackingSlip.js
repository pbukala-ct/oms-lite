import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable'

export const generatePackingSlip = (order) => {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('Packing Slip', 105, 15, null, null, 'center');
    
    // Add order information
    doc.setFontSize(12);
    doc.text(`Order ID: ${order.id}`, 20, 30);
    doc.text(`Order Date: ${format(new Date(order.createdAt), 'dd MMM yyyy')}`, 20, 40);
    doc.text(`Customer: ${order.customer}`, 20, 50);
    
    // Add shipping address
    doc.setFontSize(14);
    doc.text('Shipping Address:', 20, 65);
    doc.setFontSize(12);
    const address = order.shippingAddress;
    doc.text([
      address.streetName,
      `${address.city}, ${address.state} ${address.postalCode}`,
      address.country
    ], 20, 75);
    
    // Add items table
    doc.autoTable({
      startY: 100,
      head: [['Item', 'Quantity', 'SKU']],
      body: order.lineItems.map(item => [
        item.name.en,
        item.quantity,
        item.variant.sku
      ]),
    });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, 105, doc.internal.pageSize.height - 10, null, null, 'center');
    }
    
    // Save the PDF
    doc.save(`packing-slip-${order.id}.pdf`);
  };