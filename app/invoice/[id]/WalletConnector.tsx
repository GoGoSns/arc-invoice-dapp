'use client'

export default function WalletConnector() {
  const connectWallet = () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.request({ method: 'eth_requestAccounts' })
    }
  }

  return (
    <button onClick={connectWallet}>
      Connect Wallet
    </button>
  )
}