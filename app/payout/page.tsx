'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function BatchPayout() {
  const [recipients, setRecipients] = useState<{ address: string; amount: number }[]>([]);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setIsWalletConnected(true);
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setIsWalletConnected(true);
        setAccount(accounts[0]);
        alert('Cüzdan bağlandı!');
      } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Cüzdan bağlantısı başarısız.');
      }
    } else {
      alert('MetaMask yüklü değil.');
    }
  };

  const addRecipient = () => {
    if (address && amount) {
      setRecipients([...recipients, { address, amount: parseFloat(amount) }]);
      setAddress('');
      setAmount('');
    }
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const total = recipients.reduce((sum, r) => sum + r.amount, 0);

  const sendPayments = async () => {
    if (!isWalletConnected) {
      alert('Lütfen önce cüzdanınızı bağlayın.');
      return;
    }
    if (recipients.length === 0) {
      alert('Ödeme yapılacak alıcı yok.');
      return;
    }

    try {
      alert('Ödeme işlemi başlatılıyor...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Smart contract iskeleti (örnek adres)
      const contractAddress = '0x0000000000000000000000000000000000000000';
      // Burada gerçek contract ABI ve fonksiyon çağrısı eklenecek
      // Örneğin: const contract = new ethers.Contract(contractAddress, abi, signer);
      // await contract.batchPayout(recipients.map(r => r.address), recipients.map(r => ethers.parseUnits(r.amount.toString(), 6))); // USDC 6 decimals

      // Şimdilik sadece log
      console.log('Batch payout to:', recipients);

      alert('Ödeme işlemi tamamlandı!');
    } catch (error) {
      console.error('Error sending payments:', error);
      alert('Ödeme işlemi başarısız.');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Toplu Ödeme</h1>

      {/* Cüzdan Bağlantısı */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6 text-center">
        {isWalletConnected ? (
          <p className="text-green-600 font-medium">Cüzdan Bağlı: {account?.slice(0, 6)}...{account?.slice(-4)}</p>
        ) : (
          <button
            onClick={connectWallet}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            Cüzdan Bağla
          </button>
        )}
      </div>

      {/* Alıcı Ekle Bölümü */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Alıcı Ekle</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Cüzdan Adresi (0x...)"
            value={address}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Miktar (USDC)"
            value={amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addRecipient}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
          >
            Listeye Ekle
          </button>
        </div>
      </div>

      {/* Tablo */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <table className="w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adres</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miktar (USDC)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recipients.map((r, i) => (
              <tr key={i}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => removeRecipient(i)}
                    className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded transition duration-200"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Özet */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium">Toplam Ödenecek:</span>
          <span className="text-2xl font-bold text-green-600">{total} USDC</span>
        </div>
      </div>

      {/* Gönder Butonu */}
      <div className="text-center">
        <button
          onClick={sendPayments}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition duration-200 shadow-lg"
        >
          Arc Ağında Ödemeleri Gönder
        </button>
      </div>
    </div>
  );
}