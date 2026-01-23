'use client'
import { InjectedWalletBase } from '../../injected/InjectedWalletBase/InjectedWalletBase.js';

const getConnectorConstructorInjectedWallet = ({ key, wallet, walletBook, }) => {
    const { shortName } = wallet;
    const name = shortName || wallet.name;
    /**
     * For historical reasons, all wallet connect data for wallets reside in the EVM entry for the wallet in wallet book.
     * Therefore, in order to tell whether this Sol wallet supports wallet connect, we will have to find the wallet book
     * entry that has the wallet connect data for it.
     */
    let walletConnectWalletBookEntry = undefined;
    if (wallet.group) {
        walletConnectWalletBookEntry = Object.values(walletBook.wallets).find((entry) => {
            var _a;
            return entry.walletConnect &&
                entry.group === wallet.group &&
                (
                // Disregard if the wallet connect data does not support Solana. WC chains are prefixed with 'solana:'
                // as they follow CAIP-2 format
                (_a = entry.chains) === null || _a === void 0 ? void 0 : _a.some((chain) => chain.includes('solana:')));
        });
    }
    const InjectedWalletConstructor = class extends InjectedWalletBase {
        constructor() {
            super(...arguments);
            this.walletName = name;
            this.name = name;
            this.walletConnectWalletBookEntry = walletConnectWalletBookEntry;
            // this is the key from the wallet book entry so that we don't purely rely on the normalized name
            this.overrideKey = key;
        }
    };
    // Add this key so we can later tell which wallet each constructor is for
    Object.defineProperty(InjectedWalletConstructor, 'key', {
        value: key,
        writable: false,
    });
    return InjectedWalletConstructor;
};

export { getConnectorConstructorInjectedWallet };
