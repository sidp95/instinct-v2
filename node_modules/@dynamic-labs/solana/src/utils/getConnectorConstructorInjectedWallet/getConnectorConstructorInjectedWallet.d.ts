import { WalletBookSchema, WalletSchema } from '@dynamic-labs/wallet-book';
import { WalletConnectorConstructor } from '@dynamic-labs/wallet-connector-core';
type GetConnectorConstructorInjectedWalletProps = {
    key: string;
    wallet: WalletSchema;
    walletBook: WalletBookSchema;
};
export declare const getConnectorConstructorInjectedWallet: ({ key, wallet, walletBook, }: GetConnectorConstructorInjectedWalletProps) => WalletConnectorConstructor;
export {};
