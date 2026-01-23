import { ISolanaSigner } from '@dynamic-labs/solana-core';
import { SolanaWalletConnectConnector } from '../SolanaWalletConnectConnector';
type CreateSolanaSignerForWalletConnectProps = {
    walletConnector: SolanaWalletConnectConnector;
};
export declare const createSolanaSignerForWalletConnect: ({ walletConnector, }: CreateSolanaSignerForWalletConnectProps) => ISolanaSigner;
export {};
