'use client'
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