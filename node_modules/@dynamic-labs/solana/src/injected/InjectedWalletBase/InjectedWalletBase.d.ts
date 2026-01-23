import { SolanaWalletConnector, type ISolana } from '@dynamic-labs/solana-core';
import { IUITransaction } from '@dynamic-labs/types';
import { ISendBalanceWalletConnector } from '@dynamic-labs/wallet-connector-core';
import { WalletSchema } from '@dynamic-labs/wallet-book';
import { SolProviderHelper } from '../../SolProviderHelper';
export declare abstract class InjectedWalletBase extends SolanaWalletConnector implements ISendBalanceWalletConnector {
    _solProviderHelper: SolProviderHelper | undefined;
    /**
     * For historical reasons, all wallet connect data for wallets reside in the EVM entry for the wallet in wallet book.
     * Therefore, for Solana wallets that support wallet connect, we must also hold the reference to the wallet book
     * entry that has the wallet connect data for it.
     */
    walletConnectWalletBookEntry: WalletSchema | undefined;
    getMobileOrInstalledWallet(): InjectedWalletBase;
    get solProviderHelper(): SolProviderHelper | undefined;
    findProvider(): ISolana | undefined;
    setupEventListeners(): void;
    teardownEventListeners(): void;
    connect(): Promise<void>;
    getSigner<T = ISolana>(): Promise<T | undefined>;
    createUiTransaction(from: string): Promise<IUITransaction>;
    isInstalledOnBrowser(): boolean;
    getAddress(): Promise<string | undefined>;
    signMessage(messageToSign: string): Promise<string | undefined>;
    getConnectedAccounts(): Promise<string[]>;
}
