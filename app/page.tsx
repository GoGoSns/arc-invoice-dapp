'use client'

export default function Home() {
  return (
    <button onClick={() => alert('test')}>Test</button>
  )
}'use client'
import { useState } from 'react'

export default function Home() {
  const connectWallet = async () => {
    alert('clicked')
    const accounts = await (window as any).ethereum.request({method: 'eth_requestAccounts'})
    alert(accounts[0])
  }

  return (
    <button onClick={connectWallet}>Connect Wallet</button>
  )
}
}