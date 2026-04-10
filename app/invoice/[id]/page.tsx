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
    console.log('InvoicePage: Component mounted, checking wallet connection...')
    
    const data = localStorage.getItem(`invoice_${id}`)
    if (data) {
      setInvoice(JSON.parse(data))
    }
    
    // Check if wallet is already connected
    const checkWalletConnection = async () => {
      console.log('InvoicePage: Checking wallet connection...')
      console.log('InvoicePage: window.ethereum exists:', typeof (window as any).ethereum !== 'undefined')
      
      if (typeof (window as any).ethereum !== 'undefined') {
        try {
          console.log('InvoicePage: Requesting accounts...')
          const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' })
          console.log('InvoicePage: Accounts found:', accounts)
          
          if (accounts.length > 0) {
            const provider = new ethers.BrowserProvider((window as any).ethereum)
            const network = await provider.getNetwork()
            console.log('InvoicePage: Network:', network)
            
            setWalletConnected(true)
            setCurrentNetwork(Number(network.chainId))
            console.log('InvoicePage: Wallet connected, network:', Number(network.chainId))
          } else {
            console.log('InvoicePage: No accounts connected')
          }
        } catch (error) {
          console.error('InvoicePage: Error checking wallet connection:', error)
        }
      } else {
        console.log('InvoicePage: MetaMask not detected')
      }
    }
    
    checkWalletConnection()
  }, [id])

  const handleConnectWallet = () => {
    console.log('Button clicked: Connect Wallet')
    connectWallet()
  }

  const connectWallet = async () => {
    console.log('connectWallet: Function called')
    
    if (typeof (window as any).ethereum !== 'undefined') {
      console.log('connectWallet: MetaMask detected, proceeding...')
      
      try {
        console.log('connectWallet: Requesting account access...')
        // Request account access
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
        console.log('connectWallet: Account access granted')
        
        const provider = new ethers.BrowserProvider((window as any).ethereum)
        const network = await provider.getNetwork()
        console.log('connectWallet: Current network:', network)
        
        // Check if we're on the correct network
        if (Number(network.chainId) !== ARC_CHAIN_ID) {
          console.log('connectWallet: Wrong network, attempting to switch...')
          
          try {
            // Try to switch to Arc Testnet
            console.log('connectWallet: Switching to Arc Testnet...')
            await (window as any).ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${ARC_CHAIN_ID.toString(16)}` }],
            })
            console.log('connectWallet: Successfully switched to Arc Testnet')
          } catch (switchError: any) {
            console.log('connectWallet: Switch failed, error code:', switchError.code)
            
            // If network doesn't exist, add it
            if (switchError.code === 4902) {
              console.log('connectWallet: Network not found, adding Arc Testnet...')
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
              console.log('connectWallet: Arc Testnet added successfully')
            } else {
              console.error('connectWallet: Unexpected switch error:', switchError)
              throw switchError
            }
          }
        } else {
          console.log('connectWallet: Already on Arc Testnet')
        }
        
        // Update connection status
        setWalletConnected(true)
        const updatedProvider = new ethers.BrowserProvider((window as any).ethereum)
        const updatedNetwork = await updatedProvider.getNetwork()
        setCurrentNetwork(Number(updatedNetwork.chainId))
        console.log('connectWallet: Connection status updated, network:', Number(updatedNetwork.chainId))
        
        alert('Successfully connected to Arc Testnet!')
      } catch (error) {
        console.error('connectWallet: Failed to connect wallet:', error)
        alert('Failed to connect wallet. Please try again.')
      }
    } else {
      console.log('connectWallet: MetaMask not detected')
      alert('MetaMask not installed. Please install MetaMask from https://metamask.io/ to continue.')
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
              onClick={handleConnectWallet}
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