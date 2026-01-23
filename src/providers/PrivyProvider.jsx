import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from '@privy-io/react-auth/solana';

const solanaConnectors = toSolanaWalletConnectors();

export default function PrivyProviderWrapper({ children }) {
  return (
    <PrivyProvider
      appId="cmknxjckz01iwia0cxphyqk8p"
      config={{
        loginMethods: ['email'],
        appearance: {
          theme: 'light',
          accentColor: '#000000',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          solana: {
            createOnLogin: 'users-without-wallets',
          },
        },
        externalWallets: {
          solana: {
            connectors: solanaConnectors,
          },
        },
        solanaClusters: [
          {
            name: 'mainnet-beta',
            rpcUrl: 'https://mainnet.helius-rpc.com/?api-key=fc70f382-f7ec-48d3-a615-9bacd782570e',
          },
        ],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
