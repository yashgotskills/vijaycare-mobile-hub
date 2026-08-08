import { jsPDF } from "jspdf";
import { isWarrantyEligible, WARRANTY_SUMMARY } from "@/lib/warranty";

export interface InvoiceOrder {
  order_number: string;
  status: string;
  total_amount: number;
  payment_method?: string | null;
  created_at: string;
  items: any[];
}

export const downloadInvoicePdf = (order: InvoiceOrder) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 48;
  let y = 56;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("VijayCare", marginX, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Where Mobile Meet Care", marginX, y + 15);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Invoice / Receipt", pageWidth - marginX, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Order: ${order.order_number}`, pageWidth - marginX, y + 15, { align: "right" });
  doc.text(
    `Date: ${new Date(order.created_at).toLocaleDateString("en-IN")}`,
    pageWidth - marginX,
    y + 29,
    { align: "right" }
  );

  y += 56;
  doc.setDrawColor(200);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 22;

  doc.setFontSize(10);
  doc.text(`Status: ${order.status}`, marginX, y);
  doc.text(`Payment: ${order.payment_method || "COD"}`, marginX + 200, y);
  y += 26;

  // Table header
  doc.setFont("helvetica", "bold");
  doc.text("Item", marginX, y);
  doc.text("Qty", pageWidth - marginX - 170, y, { align: "right" });
  doc.text("Price", pageWidth - marginX - 90, y, { align: "right" });
  doc.text("Amount", pageWidth - marginX, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  y += 8;
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 18;

  const items = Array.isArray(order.items) ? order.items : [];
  const eligible: string[] = [];

  items.forEach((item: any) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.price) || 0;
    const covered = isWarrantyEligible({
      flag: item.hasLifetimeWarranty,
      category: item.category,
      name: item.name,
    });
    if (covered) eligible.push(item.name);

    const nameLines = doc.splitTextToSize(
      `${item.name}${item.selectedModel ? ` (${item.selectedModel})` : ""}`,
      pageWidth - marginX * 2 - 200
    );
    doc.text(nameLines, marginX, y);
    doc.text(String(qty), pageWidth - marginX - 170, y, { align: "right" });
    doc.text(`Rs. ${price.toLocaleString("en-IN")}`, pageWidth - marginX - 90, y, { align: "right" });
    doc.text(`Rs. ${(price * qty).toLocaleString("en-IN")}`, pageWidth - marginX, y, { align: "right" });
    y += nameLines.length * 13;

    if (covered) {
      doc.setFontSize(9);
      doc.setTextColor(20, 120, 70);
      doc.text("Lifetime warranty eligible", marginX + 8, y);
      doc.setTextColor(0);
      doc.setFontSize(10);
      y += 13;
    }
    y += 6;
  });

  y += 4;
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 20;
  doc.setFont("helvetica", "bold");
  doc.text("Total", pageWidth - marginX - 90, y, { align: "right" });
  doc.text(`Rs. ${Number(order.total_amount || 0).toLocaleString("en-IN")}`, pageWidth - marginX, y, {
    align: "right",
  });
  doc.setFont("helvetica", "normal");
  y += 34;

  if (eligible.length > 0) {
    const boxWidth = pageWidth - marginX * 2;
    const textWidth = boxWidth - 24;
    const covLines = doc.splitTextToSize(`Covered items: ${eligible.join(", ")}`, textWidth);
    const noteLines = doc.splitTextToSize(WARRANTY_SUMMARY, textWidth);
    const claimLines = doc.splitTextToSize(
      "Keep this receipt as proof of purchase. Raise a claim on the Warranty page of the VijayCare app.",
      textWidth
    );

    const lineHeight = 12;
    const boxHeight =
      34 + (covLines.length + noteLines.length + claimLines.length) * lineHeight + 20;

    doc.setDrawColor(120);
    doc.roundedRect(marginX, y - 14, boxWidth, boxHeight, 6, 6);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Lifetime Warranty Certificate", marginX + 12, y + 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    let ty = y + 22;
    doc.text(covLines, marginX + 12, ty);
    ty += covLines.length * lineHeight + 8;
    doc.text(noteLines, marginX + 12, ty);
    ty += noteLines.length * lineHeight + 8;
    doc.text(claimLines, marginX + 12, ty);

    y += boxHeight + 10;
  }

  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text("This is a computer generated receipt.", marginX, doc.internal.pageSize.getHeight() - 40);

  doc.save(`VijayCare-Invoice-${order.order_number}.pdf`);
};
