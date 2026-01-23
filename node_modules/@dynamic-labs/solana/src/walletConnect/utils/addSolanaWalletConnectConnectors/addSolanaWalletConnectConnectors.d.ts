import { WalletBookSchema } from '@dynamic-labs/wallet-book';
import { WalletConnectorConstructor } from '@dynamic-labs/wallet-connector-core';
type FetchSolanaWalletConnectWalletsProps = {
    walletBook: WalletBookSchema;
    connectors: WalletConnectorConstructor[];
};
/**
 * Adds Solana WalletConnect connectors to the list of connectors, avoiding duplicates
 * by checking what connectors are already present
 */
export declare const addSolanaWalletConnectConnectors: ({ walletBook, connectors: currentConnectors, }: FetchSolanaWalletConnectWalletsProps) => Array<WalletConnectorConstructor>;
export {};
