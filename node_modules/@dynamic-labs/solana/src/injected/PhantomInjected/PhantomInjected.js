'use client'
import { __awaiter } from '../../../_virtual/_tslib.js';
import { isMobile, handleMobileWalletRedirect } from '@dynamic-labs/utils';
import { InjectedWalletBase } from '../InjectedWalletBase/InjectedWalletBase.js';

class PhantomInjected extends InjectedWalletBase {
    constructor() {
        super(...arguments);
        this.name = 'Phantom';
        this.overrideKey = 'phantom';
    }
    getAddress() {
        const _super = Object.create(null, {
            getAddress: { get: () => super.getAddress }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isInstalledOnBrowser()) {
                return _super.getAddress.call(this);
            }
            if (isMobile()) {
                handleMobileWalletRedirect({
                    nativeLink: 'phantom://browse',
                    universalLink: 'https://phantom.app/ul/browse',
                });
            }
            return undefined;
        });
    }
    canGetChainAddress() {
        var _a, _b;
        return ((_b = (_a = this.solProviderHelper) === null || _a === void 0 ? void 0 : _a.findProvider()) === null || _b === void 0 ? void 0 : _b.publicKey) !== null;
    }
}

export { PhantomInjected };
