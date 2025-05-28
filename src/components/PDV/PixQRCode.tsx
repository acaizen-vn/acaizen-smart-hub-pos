
import React, { useEffect, useState } from 'react';
import { storage } from '@/lib/utils';
import { PaymentGateway } from '@/types';

interface PixQRCodeProps {
  amount: number;
  onQRCodeGenerated?: (qrCode: string) => void;
}

const PixQRCode: React.FC<PixQRCodeProps> = ({ amount, onQRCodeGenerated }) => {
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    generatePixQRCode();
  }, [amount]);

  const generatePixQRCode = async () => {
    try {
      setLoading(true);
      setError('');

      // Buscar gateway configurado
      const settings = storage.getStoreSettings();
      const pixGateway = settings.paymentGateways?.find(
        (gateway: PaymentGateway) => gateway.active && gateway.type === 'mercadopago'
      );

      if (!pixGateway) {
        // QR Code estático de fallback
        const fallbackPixCode = generateStaticPixCode(amount);
        setQrCodeData(fallbackPixCode);
        onQRCodeGenerated?.(fallbackPixCode);
        setLoading(false);
        return;
      }

      // Simular geração de QR Code dinâmico
      // Em um ambiente real, aqui seria feita a chamada para a API do gateway
      const dynamicPixCode = await generateDynamicPixCode(amount, pixGateway);
      setQrCodeData(dynamicPixCode);
      onQRCodeGenerated?.(dynamicPixCode);
      
      setLoading(false);
    } catch (err) {
      console.error('Erro ao gerar QR Code Pix:', err);
      setError('Erro ao gerar QR Code do Pix');
      
      // Fallback para QR Code estático
      const fallbackPixCode = generateStaticPixCode(amount);
      setQrCodeData(fallbackPixCode);
      onQRCodeGenerated?.(fallbackPixCode);
      setLoading(false);
    }
  };

  const generateStaticPixCode = (amount: number): string => {
    // Gerar QR Code Pix estático básico
    const storeSettings = storage.getStoreSettings();
    const pixKey = storeSettings.phone || '11999999999'; // Usar telefone como chave PIX
    
    // Estrutura básica do código PIX (simplificada)
    const pixData = {
      version: '01',
      initiation: '12', // Estático
      merchantAccount: pixKey,
      amount: amount.toFixed(2),
      country: 'BR',
      city: 'SAO PAULO',
      name: storeSettings.name || 'ACAIZEN',
      txid: Date.now().toString().slice(-10)
    };

    // Simular código PIX válido
    return `00020101021226580014BR.GOV.BCB.PIX0136${pixKey}52040000530398654${pixData.amount}5802BR5915${pixData.name.substring(0, 15)}6009${pixData.city.substring(0, 9)}62070503${pixData.txid}6304`;
  };

  const generateDynamicPixCode = async (amount: number, gateway: PaymentGateway): Promise<string> => {
    // Simular chamada para API do Mercado Pago ou outro gateway
    // Em um ambiente real, aqui seria feita a requisição HTTP
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const dynamicCode = `${gateway.type}_${amount}_${Date.now()}`;
        resolve(dynamicCode);
      }, 1000);
    });
  };

  const renderQRCode = (data: string) => {
    // Usar uma biblioteca de QR Code ou serviço online
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
    
    return (
      <div className="flex flex-col items-center space-y-4">
        <img 
          src={qrCodeUrl} 
          alt="QR Code PIX" 
          className="border border-gray-300 rounded-lg"
        />
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Escaneie o código ou copie a chave PIX:
          </p>
          <div className="bg-gray-100 p-2 rounded border font-mono text-xs break-all max-w-xs">
            {data.substring(0, 50)}...
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center space-y-4 p-6">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
        <p className="text-sm text-gray-600">Gerando QR Code PIX...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center space-y-4 p-6">
        <div className="text-red-500 text-center">
          <p className="font-medium">Erro ao gerar PIX</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {renderQRCode(qrCodeData)}
    </div>
  );
};

export default PixQRCode;
