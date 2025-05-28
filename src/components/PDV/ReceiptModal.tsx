
import React, { useRef, useEffect } from 'react';
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

  // Impressão automática quando o modal abre
  useEffect(() => {
    if (open && storeSettings.print?.autoprint) {
      const timer = setTimeout(() => {
        handleAutoPrint();
      }, 1000); // Aguardar 1 segundo para garantir que o modal esteja renderizado
      
      return () => clearTimeout(timer);
    }
  }, [open, storeSettings.print?.autoprint]);

  const handleAutoPrint = () => {
    const receipt = receiptRef.current;
    if (receipt) {
      const printWindow = window.open('', '', 'height=800,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Comprovante</title>');
        printWindow.document.write(`
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600;700&display=swap');
            
            body {
              font-family: 'Roboto Mono', 'Consolas', 'Monaco', 'Courier New', monospace;
              width: 79mm;
              margin: 0;
              padding: 8px 0;
              background: white;
              color: #000;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .receipt-content {
              width: 79mm;
              padding: 0 4px;
              line-height: 1.3;
            }
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            .bold { 
              font-weight: 700; 
              color: #000;
            }
            .divider {
              border-top: 2px dashed #000;
              margin: 8px 0;
              height: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 0;
            }
            th, td {
              text-align: left;
              padding: 1px 0;
              font-size: 12px;
              line-height: 1.3;
              color: #000;
              font-weight: 500;
            }
            .item-quantity {
              width: 25px;
              text-align: center;
              font-weight: 600;
            }
            .item-price {
              width: 60px;
              text-align: right;
              font-weight: 600;
            }
            .addon-item {
              padding-left: 8px;
              font-size: 11px;
              font-weight: 500;
            }
            .observation {
              font-style: italic;
              font-size: 10px;
              padding-left: 8px;
              color: #333;
            }
            .footer {
              margin-top: 8px;
              text-align: center;
              font-size: 10px;
              font-weight: 600;
              color: #000;
            }
            .header-info {
              font-size: 11px;
              font-weight: 500;
              color: #000;
            }
            .total-section {
              font-size: 13px;
              font-weight: 700;
              color: #000;
            }
            @media print {
              body {
                font-size: 12px;
                line-height: 1.3;
                color: #000 !important;
              }
              * {
                color: #000 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          </style>
        `);
        printWindow.document.write('</head><body>');
        
        // Cliente copy
        printWindow.document.write('<div class="receipt-content">');
        printWindow.document.write(receipt.innerHTML);
        printWindow.document.write('<div class="footer">═══ VIA DO CLIENTE ═══</div>');
        printWindow.document.write('</div>');
        
        // Page break
        printWindow.document.write('<div style="page-break-before: always;"></div>');
        
        // Kitchen copy
        printWindow.document.write('<div class="receipt-content">');
        printWindow.document.write(receipt.innerHTML);
        printWindow.document.write('<div class="footer">═══ VIA DA PRODUÇÃO ═══</div>');
        printWindow.document.write('</div>');
        
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    }
  };

  const handlePrint = () => {
    handleAutoPrint();
  };

  const handleExportPDF = async () => {
    if (!receiptRef.current) return;
    
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
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
      <DialogContent className="max-w-md glass border-white/30 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Comprovante de Venda
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[500px] border rounded-lg p-3 bg-white shadow-inner">
          <div ref={receiptRef} className="print-content p-2" style={{ fontFamily: 'Roboto Mono, Consolas, Monaco, Courier New, monospace' }}>
            <div className="text-center">
              <div className="bold text-sm">{storeSettings.name}</div>
              <div className="text-xs">{storeSettings.address}</div>
              <div className="text-xs">{storeSettings.phone}</div>
              {storeSettings.instagram && <div className="text-xs">{storeSettings.instagram}</div>}
            </div>
            
            <div className="divider"></div>
            
            <div className="text-xs">
              <div><span className="bold">Cliente:</span> {sale.customerName}</div>
              <div><span className="bold">Data:</span> {formatDateTime(sale.createdAt)}</div>
              <div><span className="bold">Pagamento:</span> {getPaymentMethodName(sale.paymentMethod)}</div>
            </div>
            
            <div className="divider"></div>
            
            <table>
              <thead>
                <tr>
                  <th className="text-xs bold">Qtd</th>
                  <th className="text-xs bold">Item</th>
                  <th className="text-right text-xs bold">Valor</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr>
                      <td className="item-quantity text-xs">{item.quantity}x</td>
                      <td className="text-xs">{item.productName}</td>
                      <td className="item-price text-xs">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                    
                    {item.addOns.length > 0 && item.addOns.map((addon, index) => (
                      <tr key={`${item.id}-addon-${index}`}>
                        <td></td>
                        <td className="addon-item">+ {addon.name}</td>
                        <td className="item-price text-xs">{formatCurrency(addon.price * item.quantity)}</td>
                      </tr>
                    ))}

                    {item.acaiAddOns && item.acaiAddOns.length > 0 && item.acaiAddOns.map((addon, index) => (
                      <tr key={`${item.id}-acai-addon-${index}`}>
                        <td></td>
                        <td className="addon-item">+ {addon.name}</td>
                        <td className="item-price text-xs">{formatCurrency(addon.price * item.quantity)}</td>
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
            
            <div className="text-right">
              <div className="bold text-sm">TOTAL: {formatCurrency(sale.subtotal)}</div>
              
              {sale.paymentMethod === 'cash' && sale.cashAmount !== undefined && (
                <>
                  <div className="text-xs">VALOR PAGO: {formatCurrency(sale.cashAmount)}</div>
                  <div className="text-xs">TROCO: {formatCurrency(sale.change || 0)}</div>
                </>
              )}
            </div>
            
            <div className="divider"></div>
            
            <div className="text-center text-xs">
              <div>Obrigado pela preferência!</div>
              <div className="bold">Pedido #{sale.id.substring(0, 6)}</div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="outline" onClick={onClose} className="hover:bg-gray-50">
            Fechar
          </Button>
          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={handleExportPDF} className="hover:bg-blue-50">
              <FileText className="mr-2 h-4 w-4" />
              Salvar PDF
            </Button>
            <Button type="button" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" onClick={handlePrint}>
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
