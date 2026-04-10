'use client'

export default function WalletButton() {
  return (
    <button
      onClick={() => (window as any).ethereum?.request({method: 'eth_requestAccounts'})}
      className="px-4 py-2 bg-gradient-to-r from-purple to-blue text-white rounded-lg hover:opacity-90 transition-opacity"
    >
      Connect Wallet
    </button>
  )
}