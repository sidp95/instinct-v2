import { type Wallets } from '@wallet-standard/app';
type GetWalletStandardWalletsResult = {
    wallets: ReturnType<Wallets['get']>;
    on: Wallets['on'];
};
export declare const getWalletStandardWallets: () => GetWalletStandardWalletsResult;
export {};
