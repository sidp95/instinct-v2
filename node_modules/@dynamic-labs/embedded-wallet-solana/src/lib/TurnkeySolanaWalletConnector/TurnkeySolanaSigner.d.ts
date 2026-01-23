import { PublicKey, SendOptions, Transaction, TransactionSignature, VersionedTransaction } from '@solana/web3.js';
import { SignedMessage } from '@dynamic-labs/solana-core';
import { TurnkeySolanaWalletConnector } from './TurnkeySolanaWalletConnector';
export type IEmbeddedWalletSolanaSigner = {
    publicKey?: {
        toBytes(): Uint8Array;
    };
    isConnected: boolean;
    providers: IEmbeddedWalletSolanaSigner[];
    signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
    signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
    signAndSendTransaction<T extends Transaction | VersionedTransaction>(transaction: T, options?: SendOptions): Promise<{
        signature: TransactionSignature;
    }>;
    signMessage(message: Uint8Array, encoding?: string): Promise<SignedMessage>;
    connect: (args?: {
        onlyIfTrusted: boolean;
    }) => Promise<{
        address?: string;
        publicKey?: PublicKey;
    } | undefined>;
    disconnect(): Promise<void>;
};
export declare class TurnkeySolanaSigner implements IEmbeddedWalletSolanaSigner {
    readonly isConnected = true;
    readonly publicKey: PublicKey | undefined;
    readonly providers: this[];
    private readonly turnkeyAddress;
    private walletConnector;
    constructor({ walletConnector, }: {
        walletConnector: TurnkeySolanaWalletConnector;
    });
    signMessage(encodedMessage: Uint8Array): Promise<SignedMessage>;
    signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
    signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
    signAndSendTransaction<T extends Transaction | VersionedTransaction>(transaction: T, options?: SendOptions): Promise<{
        signature: TransactionSignature;
    }>;
    connect(_args?: {
        onlyIfTrusted?: boolean;
    }): Promise<{
        address?: string;
        publicKey?: PublicKey;
    } | undefined>;
    disconnect(): Promise<void>;
}
