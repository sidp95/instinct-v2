'use client'
import { sanitizeName } from '@dynamic-labs/utils';
import { InjectedWalletBase } from '../../InjectedWalletBase/InjectedWalletBase.js';
import { createSolanaSignerFromWalletStandard } from '../createSolanaSignerFromWalletStandard/createSolanaSignerFromWalletStandard.js';

const getConnectorConstructorForWalletStandardWallet = (wallet, walletBookMetadata = {}, walletBookKey = undefined) => {
    const sanitizedName = sanitizeName(wallet.name);
    const ConnectorConstructor = class extends InjectedWalletBase {
        constructor(props) {
            super(Object.assign(Object.assign({}, props), { metadata: Object.assign(Object.assign({}, walletBookMetadata), { groupKey: sanitizedName, icon: wallet.icon, id: sanitizedName, name: wallet.name }) }));
            this.name = wallet.name;
            this.overrideKey = `${sanitizedName}sol`;
            this._provider = createSolanaSignerFromWalletStandard({
                wallet,
                walletConnector: this,
            });
        }
        findProvider() {
            return this._provider;
        }
    };
    Object.defineProperty(ConnectorConstructor, 'key', {
        value: walletBookKey !== null && walletBookKey !== void 0 ? walletBookKey : sanitizedName,
        writable: false,
    });
    return ConnectorConstructor;
};

export { getConnectorConstructorForWalletStandardWallet };
