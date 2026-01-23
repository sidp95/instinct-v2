import { PublicKey, SendOptions, Transaction, TransactionSignature, VersionedTransaction } from '@solana/web3.js';
import EventEmitter from 'eventemitter3';
import { SignedMessage, ISolanaSigner, ConnectionResult, ISolanaEvents } from '@dynamic-labs/solana-core';
import { DynamicWaasSVMConnector } from '../connector/DynamicWaasSVMConnector';
/**
 * Signer implementation for DynamicWaasSVMConnector
 * This class provides a similar interface to TurnkeySolanaSigner
 */
export declare class DynamicWaasSVMSigner extends EventEmitter<ISolanaEvents> implements ISolanaSigner {
    readonly isConnected = true;
    readonly publicKey: PublicKey | undefined;
    readonly providers: ISolanaSigner[];
    readonly isBraveWallet = false;
    readonly isGlow = false;
    readonly isPhantom = false;
    readonly isSolflare = false;
    readonly isExodus = false;
    readonly isBackpack = false;
    readonly isMagicEden = false;
    private readonly accountAddress;
    private walletConnector;
    constructor({ walletConnector, }: {
        walletConnector: DynamicWaasSVMConnector;
    });
    signMessage(encodedMessage: Uint8Array): Promise<SignedMessage>;
    signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
    signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
    signAndSendTransaction<T extends Transaction | VersionedTransaction>(transaction: T, options?: SendOptions): Promise<{
        signature: TransactionSignature;
    }>;
    connect(_args?: {
        onlyIfTrusted?: boolean;
    }): Promise<ConnectionResult>;
    disconnect(): Promise<void>;
}
