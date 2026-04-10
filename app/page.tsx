'use client'

import { useState } from 'react'

export default function Home() {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [recipient, setRecipient] = useState('')
  const [invoiceLink, setInvoiceLink] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const id = crypto.randomUUID()
    const invoice = { id, amount, description, dueDate, recipient, paid: false }
    localStorage.setItem(`invoice_${id}`, JSON.stringify(invoice))
    setInvoiceLink(`${window.location.origin}/invoice/${id}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">Create Invoice</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white mb-2">Recipient Address</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple"
              placeholder="0x..."
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Amount (USDC)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple"
              placeholder="100"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple"
              placeholder="Invoice description"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-white mb-2">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple to-blue text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
          >
            Create Invoice
          </button>
        </form>
        {invoiceLink && (
          <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-green-400 mb-2">Invoice created! Share this link:</p>
            <a
              href={invoiceLink}
              className="text-blue-300 underline break-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              {invoiceLink}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}