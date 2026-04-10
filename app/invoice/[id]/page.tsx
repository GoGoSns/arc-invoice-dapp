'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import WalletConnector from './WalletConnector'

export default function InvoicePage() {
  const params = useParams()
  const id = params.id as string
  const [invoice, setInvoice] = useState<any>(null)

  useEffect(() => {
    const data = localStorage.getItem(`invoice_${id}`)
    if (data) {
      setInvoice(JSON.parse(data))
    }
  }, [id])

  const handlePaymentSuccess = () => {
    if (invoice) {
      setInvoice({ ...invoice, paid: true })
    }
  }

  if (!invoice) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">Invoice</h1>
        <div className="space-y-4 text-white">
          <div>
            <strong>Amount:</strong> {invoice.amount} USDC
          </div>
          <div>
            <strong>Description:</strong> {invoice.description}
          </div>
          <div>
            <strong>Due Date:</strong> {invoice.dueDate}
          </div>
          <div>
            <strong>Recipient:</strong> {invoice.recipient}
          </div>
          <div>
            <strong>Status:</strong> {invoice.paid ? 'Paid' : 'Unpaid'}
          </div>
        </div>
        {!invoice.paid && (
          <WalletConnector />
        )}
      </div>
    </div>
  )
}