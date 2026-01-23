'use client'
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utils = require('@dynamic-labs/utils');
var InjectedWalletBase = require('../../InjectedWalletBase/InjectedWalletBase.cjs');
var createSolanaSignerFromWalletStandard = require('../createSolanaSignerFromWalletStandard/createSolanaSignerFromWalletStandard.cjs');

const getConnectorConstructorForWalletStandardWallet = (wallet, walletBookMetadata = {}, walletBookKey = undefined) => {
    const sanitizedName = utils.sanitizeName(wallet.name);
    const ConnectorConstructor = class extends InjectedWalletBase.InjectedWalletBase {
        constructor(props) {
            super(Object.assign(Object.assign({}, props), { metadata: Object.assign(Object.assign({}, walletBookMetadata), { groupKey: sanitizedName, icon: wallet.icon, id: sanitizedName, name: wallet.name }) }));
            this.name = wallet.name;
            this.overrideKey = `${sanitizedName}sol`;
            this._provider = createSolanaSignerFromWalletStandard.createSolanaSignerFromWalletStandard({
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

exports.getConnectorConstructorForWalletStandardWallet = getConnectorConstructorForWalletStandardWallet;
