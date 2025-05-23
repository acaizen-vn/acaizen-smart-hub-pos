
import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sale } from '@/types';
import { formatCurrency, formatDateTime, storage } from '@/lib/utils';
import { Printer, FileText } from 'lucide-react';

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  sale: Sale;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ open, onClose, sale }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const storeSettings = storage.getStoreSettings();

  const handlePrint = () => {
    const receipt = receiptRef.current;
    if (receipt) {
      const printWindow = window.open('', '', 'height=800,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Comprovante</title>');
        printWindow.document.write(`
          <style>
            body {
              font-family: 'Courier', monospace;
              width: 79mm;
              margin: 0;
              padding: 10px 0;
            }
            .receipt-content {
              width: 79mm;
              padding: 0 5px;
            }
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            .bold { font-weight: bold; }
            .divider {
              border-top: 1px dashed #000;
              margin: 10px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              text-align: left;
              padding: 2px 0;
              font-size: 12px;
              line-height: 1.2;
            }
            .item-quantity {
              width: 30px;
              text-align: center;
            }
            .item-price {
              width: 70px;
              text-align: right;
            }
            .addon-item {
              padding-left: 10px;
              font-size: 11px;
            }
            .observation {
              font-style: italic;
              font-size: 10px;
              padding-left: 10px;
            }
            .footer {
              margin-top: 10px;
              text-align: center;
              font-size: 10px;
            }
            @media print {
              body {
                font-size: 12px;
                line-height: 1.2;
              }
            }
          </style>
        `);
        printWindow.document.write('</head><body>');
        
        // Cliente copy
        printWindow.document.write('<div class="receipt-content">');
        printWindow.document.write(receipt.innerHTML);
        printWindow.document.write('<div class="footer">VIA DO CLIENTE</div>');
        printWindow.document.write('</div>');
        
        // Page break
        printWindow.document.write('<div style="page-break-before: always;"></div>');
        
        // Kitchen copy
        printWindow.document.write('<div class="receipt-content">');
        printWindow.document.write(receipt.innerHTML);
        printWindow.document.write('<div class="footer">VIA DA PRODUÇÃO</div>');
        printWindow.document.write('</div>');
        
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  const handleExportPDF = async () => {
    if (!receiptRef.current) return;
    
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [79, canvas.height * 79 / canvas.width],
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 79, canvas.height * 79 / canvas.width);
      pdf.save(`comprovante_${sale.id.substring(0, 6)}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cash': return 'Dinheiro';
      case 'credit': return 'Cartão de Crédito';
      case 'debit': return 'Cartão de Débito';
      case 'pix': return 'Pix';
      default: return method;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md glass">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">Comprovante de Venda</DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[400px] border rounded-md p-2 bg-white">
          <div ref={receiptRef} className="print-content p-2">
            <div className="text-center">
              <div className="bold">{storeSettings.name}</div>
              <div>{storeSettings.address}</div>
              <div>{storeSettings.phone}</div>
              {storeSettings.instagram && <div>{storeSettings.instagram}</div>}
            </div>
            
            <div className="divider"></div>
            
            <div>
              <div><span className="bold">Cliente:</span> {sale.customerName}</div>
              <div><span className="bold">Data:</span> {formatDateTime(sale.createdAt)}</div>
              <div><span className="bold">Pagamento:</span> {getPaymentMethodName(sale.paymentMethod)}</div>
            </div>
            
            <div className="divider"></div>
            
            <table>
              <thead>
                <tr>
                  <th>Qtd</th>
                  <th>Item</th>
                  <th className="text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr>
                      <td className="item-quantity">{item.quantity}x</td>
                      <td>{item.productName}</td>
                      <td className="item-price">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                    
                    {item.addOns.length > 0 && item.addOns.map((addon, index) => (
                      <tr key={`${item.id}-addon-${index}`}>
                        <td></td>
                        <td className="addon-item">+ {addon.name}</td>
                        <td className="item-price">{formatCurrency(addon.price * item.quantity)}</td>
                      </tr>
                    ))}
                    
                    {item.observation && (
                      <tr>
                        <td colSpan={3} className="observation">Obs: {item.observation}</td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            
            <div className="divider"></div>
            
            <div className="text-right bold">
              <div>TOTAL: {formatCurrency(sale.subtotal)}</div>
              
              {sale.paymentMethod === 'cash' && sale.cashAmount !== undefined && (
                <>
                  <div>VALOR PAGO: {formatCurrency(sale.cashAmount)}</div>
                  <div>TROCO: {formatCurrency(sale.change || 0)}</div>
                </>
              )}
            </div>
            
            <div className="divider"></div>
            
            <div className="text-center">
              <div>Obrigado pela preferência!</div>
              <div>Pedido #{sale.id.substring(0, 6)}</div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={handleExportPDF}>
              <FileText className="mr-2 h-4 w-4" />
              Salvar PDF
            </Button>
            <Button type="button" className="btn-primary" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;
