import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { SolanaWalletConnectors } from '@dynamic-labs/solana';

/**
 * Dynamic SDK Provider Configuration
 *
 * For frictionless "sign once, swipe freely" betting experience:
 *
 * REQUIRED DASHBOARD CONFIGURATION (app.dynamic.xyz):
 * 1. Go to Dashboard > Embedded Wallets
 * 2. Set "Transactional MFA" to "None"
 * 3. Toggle OFF "Show Transaction Confirmation Screen"
 *
 * This allows users to sign transactions without popups after initial login.
 * The embedded wallet signs automatically using the session established at login.
 */
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
