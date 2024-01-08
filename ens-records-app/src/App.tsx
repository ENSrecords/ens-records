
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, useAccount } from 'wagmi'
import { config } from './config'
import { Account } from './account' 
import { WalletOptions } from './wallet-options' 
import './tailwind.css';
import { Resolver } from "./components/resolver";

const queryClient = new QueryClient()

function ConnectWallet() { 
  const { isConnected } = useAccount() 
  if (isConnected) return <Account /> 
  return <WalletOptions />
} 

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}> 
        <ConnectWallet /> 
        <Resolver />
      </QueryClientProvider> 
    </WagmiProvider>
  )
}

export default App;