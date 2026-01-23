'use client'
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var InjectedWalletBase = require('../InjectedWalletBase/InjectedWalletBase.cjs');

class FallbackSolanaConnector extends InjectedWalletBase.InjectedWalletBase {
    constructor() {
        super(...arguments);
        this.name = 'Fallback Connector';
        this.overrideKey = 'fallbackconnector';
        this.isAvailable = false;
    }
    isInstalledOnBrowser() {
        return false;
    }
}
Object.defineProperty(FallbackSolanaConnector, 'key', {
    value: 'fallbackconnector',
    writable: false,
});

exports.FallbackSolanaConnector = FallbackSolanaConnector;
