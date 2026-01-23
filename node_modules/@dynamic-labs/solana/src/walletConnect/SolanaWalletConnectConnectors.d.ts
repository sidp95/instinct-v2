import { WalletConnectorConstructor } from '@dynamic-labs/wallet-connector-core';
/**
 * Returns ALL Solana WalletConnect connectors from the wallet book.
 *
 * WARNING: This should only be used if you have no other Solana connectors.
 * If you have other Solana connectors, you should use addSolanaWalletConnectConnectors instead.
 */
export declare const SolanaWalletConnectConnectors: (props: any) => WalletConnectorConstructor[];
