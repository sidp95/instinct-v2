'use client'
import { __awaiter } from '../../_virtual/_tslib.js';
import { SolanaWalletConnector } from '@dynamic-labs/solana-core';
import { isMobile } from '@dynamic-labs/utils';
import { PhantomInjected } from '../injected/PhantomInjected/PhantomInjected.js';
import { PhantomRedirect } from '../phantomRedirect/PhantomRedirect/PhantomRedirect.js';

class Phantom extends SolanaWalletConnector {
    constructor() {
        super(...arguments);
        this.name = 'Phantom';
        this.overrideKey = 'phantom';
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.getMobileOrInstalledWallet().connect();
        });
    }
    getSigner() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getMobileOrInstalledWallet().getSigner();
        });
    }
    getMobileOrInstalledWallet() {
        const phantomInjected = new PhantomInjected(this.constructorProps);
        if (isMobile() &&
            !phantomInjected.isInstalledOnBrowser() &&
            this.mobileExperience === 'redirect') {
            return new PhantomRedirect(this.constructorProps);
        }
        return phantomInjected;
    }
}
Object.defineProperty(Phantom, 'key', {
    value: 'phantom',
    writable: false,
});

export { Phantom };
