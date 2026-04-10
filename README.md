# USDC Invoice Generator Dapp

A decentralized application for creating and paying invoices with USDC on the Arc Testnet.

## Features

- Create invoices with amount, description, due date, and recipient address
- Generate unique shareable links for each invoice
- Pay invoices using MetaMask and USDC tokens
- Integrated with Arc Testnet (Chain ID: 5042002)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Fill in the invoice details and create an invoice.
2. Share the generated link with the payer.
3. The payer connects MetaMask and pays with USDC.

## Technologies

- Next.js 14
- TypeScript
- Tailwind CSS
- ethers.js
- Arc Testnet

## Contract Details

- USDC Contract: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
- RPC URL: https://rpc.testnet.arc.network