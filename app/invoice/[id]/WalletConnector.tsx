'use client'

export default function WalletConnector() {
  return (
    <button onClick={() => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        (window as any).ethereum.request({ method: 'eth_requestAccounts' })
      }
    }}>
      Connect Wallet
    </button>
  )
}