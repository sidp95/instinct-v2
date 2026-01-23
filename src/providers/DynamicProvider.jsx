import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { SolanaWalletConnectors } from '@dynamic-labs/solana';

export default function DynamicProviderWrapper({ children }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: 'efb7e70d-a833-428e-9537-c9510cf2c7ae',
        walletConnectors: [SolanaWalletConnectors],
        // Only show email login, hide external wallet options
        overrides: {
          views: [
            {
              type: 'login',
              sections: [
                { type: 'email' },
              ],
            },
          ],
        },
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
