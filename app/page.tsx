'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
const ARC_CHAIN_ID = 5042002
const RPC_URL = 'https://rpc.testnet.arc.network'

export default function Home() {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [recipient, setRecipient] = useState('')
  const [invoiceLink, setInvoiceLink] = useState('')
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        setIsWalletConnected(accounts.length > 0)
      } catch (error) {
        console.error('Error checking wallet connection:', error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isWalletConnected) {
      alert('Please connect your wallet first')
      return
    }

    setIsLoading(true)
    try {
      // Switch to Arc Testnet if not already on it
      const provider = new ethers.BrowserProvider(window.ethereum)
      const network = await provider.getNetwork()

      if (Number(network.chainId) !== ARC_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${ARC_CHAIN_ID.toString(16)}` }],
          })
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${ARC_CHAIN_ID.toString(16)}`,
                chainName: 'Arc Testnet',
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                rpcUrls: [RPC_URL],
                blockExplorerUrls: ['https://explorer.testnet.arc.network']
              }]
            })
          } else {
            throw switchError
          }
        }
      }

      // Create USDC contract instance
      const signer = await provider.getSigner()
      const usdcContract = new ethers.Contract(
        USDC_ADDRESS,
        ['function transfer(address to, uint amount) public returns (bool)', 'function decimals() public view returns (uint8)'],
        signer
      )

      // Get decimals and calculate amount
      const decimals = await usdcContract.decimals()
      const transferAmount = ethers.parseUnits(amount, decimals)

      // Send USDC transfer transaction
      const tx = await usdcContract.transfer(recipient, transferAmount)
      await tx.wait()

      // Create invoice record
      const id = crypto.randomUUID()
      const invoice = { id, amount, description, dueDate, recipient, paid: true, txHash: tx.hash }
      localStorage.setItem(`invoice_${id}`, JSON.stringify(invoice))
      setInvoiceLink(`${window.location.origin}/invoice/${id}`)

      alert('Invoice created and USDC sent successfully!')
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert('Failed to create invoice. Please check your USDC balance and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isWalletConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-6 text-white">ArcPay - USDC Invoice Generator</h1>
          <p className="text-white mb-6">Please connect your MetaMask wallet to create invoices</p>
          <p className="text-gray-300 text-sm">This app sends USDC on Arc Testnet when creating invoices</p>
        </div>
      </div>
    )
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
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-purple to-blue text-white rounded-lg hover:opacity-90 transition-opacity font-semibold disabled:opacity-50"
          >
            {isLoading ? 'Creating Invoice...' : 'Create Invoice & Send USDC'}
          </button>
        </form>
        {invoiceLink && (
          <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-green-400 mb-2">Invoice created and USDC sent! Share this link:</p>
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