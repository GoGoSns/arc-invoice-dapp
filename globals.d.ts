import type { MetaMaskInpageProvider } from '@metamask/types';

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}