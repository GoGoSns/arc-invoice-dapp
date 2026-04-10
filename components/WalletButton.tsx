'use client'

export default function WalletButton() {
  const connect = async () => {
    await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
  }
  return (
    <button onClick={connect} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg">
      Connect Wallet
    </button>
  )
}