'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function InvoicePage() {
  const params = useParams()
  const id = params.id as string
  const [invoice, setInvoice] = useState<any>(null)
  const [account, setAccount] = useState<string>('')
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem(`invoice_${id}`)
    if (data) setInvoice(JSON.parse(data))
  }, [id])

  const connectAndPay = async () => {
    const eth = (window as any).ethereum
    if (!eth) { alert('MetaMask yükleyin!'); return }
    const accounts = await eth.request({ method: 'eth_requestAccounts' })
    setAccount(accounts[0])
    setPaying(true)
    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x4CE052' }],
      })
      const amount = BigInt(Math.floor(invoice.amount * 1e6))
      const data = '0xa9059cbb' +
        invoice.recipient.slice(2).padStart(64, '0') +
        amount.toString(16).padStart(64, '0')
      const tx = await eth.request({
        method: 'eth_sendTransaction',
        params: [{ from: accounts[0], to: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', data }],
      })
      const updated = { ...invoice, paid: true, txHash: tx }
      localStorage.setItem(`invoice_${id}`, JSON.stringify(updated))
      setInvoice(updated)
      alert('Ödeme başarılı!')
    } catch (e: any) {
      alert('Hata: ' + e.message)
    }
    setPaying(false)
  }

  if (!invoice) return <div className="min-h-screen flex items-center justify-center"><div className="text-white">Loading...</div></div>

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">Invoice</h1>
        <div className="space-y-4 text-white">
          <div><strong>Amount:</strong> {invoice.amount} USDC</div>
          <div><strong>Description:</strong> {invoice.description}</div>
          <div><strong>Due Date:</strong> {invoice.dueDate}</div>
          <div><strong>Recipient:</strong> {invoice.recipient}</div>
          <div><strong>Status:</strong> {invoice.paid ? '✅ Paid' : '⏳ Unpaid'}</div>
          {invoice.txHash && (
            <div><strong>Transaction:</strong>{' '}
              <a href={`https://testnet.arcscan.app/tx/${invoice.txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">Explorer'da Gör</a>
            </div>
          )}
        </div>
        {!invoice.paid && (
          <button onClick={connectAndPay} disabled={paying}
            className="mt-6 w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-bold hover:opacity-90 disabled:opacity-50">
            {paying ? 'İşleniyor...' : account ? `${invoice.amount} USDC Öde` : 'Bağlan ve Öde'}
          </button>
        )}
        {invoice.paid && (
          <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-center">✅ Bu fatura ödendi</p>
          </div>
        )}
      </div>
    </div>
  )
}