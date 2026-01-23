'use client'
import { getWallets } from '@wallet-standard/app';
import { get } from '@dynamic-labs/utils';

const findWalletProviderFromWalletStandard = (injectConfig) => {
    const { walletStandardLocators } = injectConfig;
    if (!walletStandardLocators || walletStandardLocators.length === 0) {
        return undefined;
    }
    const wallets = getWallets().get();
    return walletStandardLocators.reduce((provider, walletStandardLocator) => {
        /**
         * Return early if the provider is already found
         */
        if (provider) {
            return provider;
        }
        const wallet = wallets.find((w) => w.name === walletStandardLocator.name);
        if (!wallet)
            return undefined;
        return get(wallet, walletStandardLocator.locator);
    }, undefined);
};

export { findWalletProviderFromWalletStandard };
