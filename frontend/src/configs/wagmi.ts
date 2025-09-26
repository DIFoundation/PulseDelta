import { createConfig, http } from 'wagmi';
import { blockdagPrimordial } from '../chains';
import { getDefaultConfig } from 'connectkit';

// Get the RPC URL from environment variables or use the default
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.primordial.bdagscan.com';

export const config = createConfig(
  getDefaultConfig({
    // Required API Keys
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-walletconnect-project-id',
    
    // Required app info
    appName: 'PulseDelta',
    appDescription: 'PulseDelta Prediction Markets',
    appUrl: 'https://pulsedelta.xyz',
    appIcon: '/logo.png',
    
    // Configure chains
    chains: [blockdagPrimordial],
    
    // Configure RPC URLs
    transports: {
      [blockdagPrimordial.id]: http(RPC_URL),
    },
    
    // Optional: Override default options
    ssr: true,
    
    // Optional: Customize wallet options
    walletConnectMetadata: {
      name: 'PulseDelta',
      description: 'Trade prediction markets on BlockDAG',
      url: 'https://pulsedelta.xyz',
      icons: ['https://pulsedelta.xyz/logo.png'],
    },
  })
);

// Export the config as default
export default config;
