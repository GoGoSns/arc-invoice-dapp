'use client'

export default function WalletButton() {
  return (
    <button onClick={() => window.ethereum.request({method: 'eth_requestAccounts'})}>
      Connect Wallet
    </button>
  )
}