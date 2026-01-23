import { Wallet } from '@wallet-standard/base';
import { WalletConnectorConstructor, WalletMetadata } from '@dynamic-labs/wallet-connector-core';
export declare const getConnectorConstructorForWalletStandardWallet: (wallet: Wallet, walletBookMetadata?: Partial<WalletMetadata>, walletBookKey?: string | undefined) => WalletConnectorConstructor;
