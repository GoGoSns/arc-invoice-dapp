'use client'

import { useState, useEffect } from 'react'

export default function WalletButton() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState('')

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setIsConnected(true)
          setAddress(accounts[0])
        }
      } catch (error) {
        console.error('Error checking connection:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        setIsConnected(true)
        setAddress(accounts[0])
      } catch (error) {
        console.error('Error connecting wallet:', error)
      }
    }
  }

  return (
    <button
      onClick={connectWallet}
      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg"
    >
      {isConnected ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}
    </button>
  )
}