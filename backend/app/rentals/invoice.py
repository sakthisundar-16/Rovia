import io
import uuid
from decimal import Decimal
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from app.rentals.models import Rental

def generate_invoice_pdf(rental: Rental, organization, customer) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=18)
    elements = []
    
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    normal_style = styles['Normal']
    
    # Header
    elements.append(Paragraph(f"<b>INVOICE</b> - {organization.name}", title_style))
    elements.append(Spacer(1, 12))
    
    # Rental Details
    elements.append(Paragraph(f"<b>Rental ID:</b> {str(rental.id)}", normal_style))
    elements.append(Paragraph(f"<b>Customer:</b> {customer.name} ({customer.email})", normal_style))
    elements.append(Paragraph(f"<b>Start Date:</b> {rental.start_datetime.strftime('%Y-%m-%d %H:%M')}", normal_style))
    elements.append(Paragraph(f"<b>Return Date:</b> {rental.actual_return_datetime.strftime('%Y-%m-%d %H:%M') if rental.actual_return_datetime else 'N/A'}", normal_style))
    elements.append(Spacer(1, 24))
    
    # Line Items Table
    data = [['Item', 'Qty', 'Unit Price', 'Total']]
    
    subtotal = Decimal('0.00')
    for item in rental.items:
        # Simplistic assumption for demo, wait, item doesn't have name directly, we'd need to load product
        # but let's assume we just print ID or maybe we can assume product is joined
        product_name = item.product.name if hasattr(item, 'product') and item.product else str(item.product_id)
        
        line_total = item.unit_price * item.quantity
        subtotal += line_total
        data.append([
            product_name,
            str(item.quantity),
            f"{item.unit_price:.2f}",
            f"{line_total:.2f}"
        ])
        
    data.append(['', '', 'Subtotal:', f"{subtotal:.2f}"])
    
    # Assuming late fees and damages are not explicitly in Rental model yet, maybe get from DepositService
    # For now, just print what's available
    data.append(['', '', 'Security Deposit:', f"{rental.security_deposit_amount:.2f}"])
    
    t = Table(data, colWidths=[250, 50, 100, 100])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.grey),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 12),
        ('BACKGROUND', (0,-2), (-1,-1), colors.beige),
        ('GRID', (0,0), (-1,-1), 1, colors.black),
    ]))
    
    elements.append(t)
    elements.append(Spacer(1, 24))
    
    elements.append(Paragraph("Thank you for renting with us!", normal_style))
    
    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
