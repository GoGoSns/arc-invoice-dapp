'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ethers } from 'ethers'

const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
const ARC_CHAIN_ID = 5042002
const RPC_URL = 'https://rpc.testnet.arc.network'

export default function InvoicePage() {
  const params = useParams()
  const id = params.id as string
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [currentNetwork, setCurrentNetwork] = useState<number | null>(null)

  useEffect(() => {
    const data = localStorage.getItem(`invoice_${id}`)
    if (data) {
      setInvoice(JSON.parse(data))
    }
    
    // Check if wallet is already connected
    const checkWalletConnection = async () => {
      if (typeof (window as any).ethereum !== 'undefined') {
        try {
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            const provider = new ethers.BrowserProvider((window as any).ethereum)
            const network = await provider.getNetwork()
            setWalletConnected(true)
            setCurrentNetwork(Number(network.chainId))
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error)
        }
      }
    }
    
    checkWalletConnection()
  }, [id])

  const connectWallet = async () => {
    if (typeof (window as any).ethereum !== 'undefined') {
      try {
        // Request account access
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
        
        const provider = new ethers.BrowserProvider((window as any).ethereum)
        const network = await provider.getNetwork()
        
        // Check if we're on the correct network
        if (Number(network.chainId) !== ARC_CHAIN_ID) {
          try {
            // Try to switch to Arc Testnet
            await (window as any).ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${ARC_CHAIN_ID.toString(16)}` }],
            })
          } catch (switchError: any) {
            // If network doesn't exist, add it
            if (switchError.code === 4902) {
              await (window as any).ethereum.request({
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
        
        // Update connection status
        setWalletConnected(true)
        const updatedProvider = new ethers.BrowserProvider((window as any).ethereum)
        const updatedNetwork = await updatedProvider.getNetwork()
        setCurrentNetwork(Number(updatedNetwork.chainId))
        
        alert('Successfully connected to Arc Testnet!')
      } catch (error) {
        console.error('Failed to connect wallet:', error)
        alert('Failed to connect wallet. Please try again.')
      }
    } else {
      alert('MetaMask not installed. Please install MetaMask to continue.')
    }
  }

  const payInvoice = async () => {
    if (!invoice) return
    setLoading(true)
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const network = await provider.getNetwork()
      
      // Ensure we're on Arc Testnet
      if (Number(network.chainId) !== ARC_CHAIN_ID) {
        alert('Please connect to Arc Testnet first by clicking "Connect MetaMask"')
        setLoading(false)
        return
      }
      
      const signer = await provider.getSigner()
      const usdcContract = new ethers.Contract(USDC_ADDRESS, [
        'function transfer(address to, uint amount) public returns (bool)',
        'function decimals() public view returns (uint8)'
      ], signer)
      
      const decimals = await usdcContract.decimals()
      const amount = ethers.parseUnits(invoice.amount, decimals)
      
      const tx = await usdcContract.transfer(invoice.recipient, amount)
      await tx.wait()
      
      invoice.paid = true
      localStorage.setItem(`invoice_${id}`, JSON.stringify(invoice))
      setInvoice({ ...invoice })
      alert('Payment successful!')
    } catch (error) {
      console.error('Payment failed:', error)
      alert('Payment failed. Please check your USDC balance and try again.')
    } finally {
      setLoading(false)
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
          <div className="mt-6 space-y-4">
            <div className="text-sm text-gray-300">
              Status: {walletConnected ? 
                (currentNetwork === ARC_CHAIN_ID ? 'Connected to Arc Testnet' : 'Wrong network - please connect') 
                : 'Not connected'}
            </div>
            <button
              onClick={connectWallet}
              className="w-full py-3 bg-gradient-to-r from-purple to-blue text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
            >
              {walletConnected && currentNetwork === ARC_CHAIN_ID ? 'Switch Network' : 'Connect MetaMask'}
            </button>
            {walletConnected && currentNetwork === ARC_CHAIN_ID && (
              <button
                onClick={payInvoice}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity font-semibold disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Pay with USDC'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}