import { Wallet } from '@wallet-standard/base';
import { ISolana } from '@dynamic-labs/solana-core';
import { InjectedWalletBase } from '../../InjectedWalletBase';
type CreateSolanaSignerFromWalletStandardProps = {
    wallet: Wallet;
    walletConnector: InjectedWalletBase;
};
export declare const createSolanaSignerFromWalletStandard: ({ wallet, walletConnector, }: CreateSolanaSignerFromWalletStandardProps) => ISolana;
export {};
