import { SolanaWalletConnector, type ISolana } from '@dynamic-labs/solana-core';
import { WalletConnectorCore } from '@dynamic-labs/wallet-connector-core';
export declare class Phantom extends SolanaWalletConnector {
    name: string;
    overrideKey: string;
    connect(): Promise<void>;
    getSigner(): Promise<ISolana | undefined>;
    getMobileOrInstalledWallet(): WalletConnectorCore.WalletConnector;
}
