import { WalletConnectorConstructor } from '@dynamic-labs/wallet-connector-core';
import { SolanaConnectionConfig } from '@dynamic-labs/solana-core';
/**
 * Allows passing in Solana connection configuration to all wallet connectors.
 */
export declare const SolanaWalletConnectorsWithConfig: (connectionConfig: SolanaConnectionConfig) => (props: any) => WalletConnectorConstructor[];
