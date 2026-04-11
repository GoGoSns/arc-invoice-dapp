'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [recipient, setRecipient] = useState('')
  const [invoiceLink, setInvoiceLink] = useState('')
  const [account, setAccount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const eth = (window as any).ethereum
    if (eth) {
      eth.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts.length > 0) setAccount(accounts[0])
      })
      eth.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts[0] || '')
      })
    }
  }, [])

  const connectWallet = async () => {
    const eth = (window as any).ethereum
    if (!eth) { alert('MetaMask yukleyin!'); return }
    const accounts = await eth.request({ method: 'eth_requestAccounts' })
    setAccount(accounts[0])
  }

  const createInvoice = async () => {
    if (!amount || !description || !dueDate || !recipient) {
      alert('Tum alanlari doldurun!')
      return
    }
    setIsLoading(true)
    const eth = (window as any).ethereum
    try {
      await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x4CE052' }] })
      const id = crypto.randomUUID()
      const invoice = { id, amount: parseFloat(amount), description, dueDate, recipient, paid: false, txHash: null }
      localStorage.setItem(`invoice_${id}`, JSON.stringify(invoice))
      setInvoiceLink(`${window.location.origin}/invoice/${id}`)
      setAmount(''); setDescription(''); setDueDate(''); setRecipient('')
    } catch (error: any) {
      alert('Hata: ' + (error.message || 'Bilinmeyen hata'))
    }
    setIsLoading(false)
  }

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-6 text-white">ArcPay - USDC Invoice Generator</h1>
          <p className="text-gray-300 mb-6">Fatura olusturmak icin cuzdaninizi baglayin</p>
          <button onClick={connectWallet} className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-bold hover:opacity-90">
            MetaMask Bagla
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Fatura Olustur</h1>
          <span className="text-gray-400 text-sm">{account.slice(0,6)}...{account.slice(-4)}</span>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-white mb-2">Alici Adresi</label>
            <input type="text" value={recipient} onChange={(e) => setRecipient(e.target.value)} className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="0x..." />
          </div>
          <div>
            <label className="block text-white mb-2">Miktar (USDC)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="10" />
          </div>
          <div>
            <label className="block text-white mb-2">Aciklama</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Fatura aciklamasi" rows={3} />
          </div>
          <div>
            <label className="block text-white mb-2">Son Tarih</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <button onClick={createInvoice} disabled={isLoading} className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-bold hover:opacity-90 disabled:opacity-50">
            {isLoading ? 'Olusturuluyor...' : 'Fatura Olustur'}
          </button>
        </div>
        {invoiceLink && (
          <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-green-400 mb-2">Fatura olusturuldu! Linki paylas:</p>
            <a href={invoiceLink} className="text-blue-300 underline break-all" target="_blank" rel="noopener noreferrer">{invoiceLink}</a>
          </div>
        )}
      </div>
    </div>
  )
}
