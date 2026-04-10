import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import WalletButton from '../components/WalletButton'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ArcPay - USDC Invoice Generator',
  description: 'Generate and pay invoices with USDC on Arc Testnet',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="flex justify-between items-center p-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple to-blue bg-clip-text text-transparent">
            ArcPay
          </h1>
          <WalletButton />
        </header>
        {children}
      </body>
    </html>
  )
}