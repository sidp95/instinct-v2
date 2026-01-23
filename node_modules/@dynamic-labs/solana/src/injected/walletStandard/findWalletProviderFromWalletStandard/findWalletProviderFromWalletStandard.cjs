'use client'
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var app = require('@wallet-standard/app');
var utils = require('@dynamic-labs/utils');

const findWalletProviderFromWalletStandard = (injectConfig) => {
    const { walletStandardLocators } = injectConfig;
    if (!walletStandardLocators || walletStandardLocators.length === 0) {
        return undefined;
    }
    const wallets = app.getWallets().get();
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
        return utils.get(wallet, walletStandardLocator.locator);
    }, undefined);
};

exports.findWalletProviderFromWalletStandard = findWalletProviderFromWalletStandard;
