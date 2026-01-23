'use client'
import { InjectedWalletBase } from '../InjectedWalletBase/InjectedWalletBase.js';

class FallbackSolanaConnector extends InjectedWalletBase {
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

export { FallbackSolanaConnector };
