'use client'
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _tslib = require('../../../_virtual/_tslib.cjs');
var utils = require('@dynamic-labs/utils');
var InjectedWalletBase = require('../InjectedWalletBase/InjectedWalletBase.cjs');

class PhantomInjected extends InjectedWalletBase.InjectedWalletBase {
    constructor() {
        super(...arguments);
        this.name = 'Phantom';
        this.overrideKey = 'phantom';
    }
    getAddress() {
        const _super = Object.create(null, {
            getAddress: { get: () => super.getAddress }
        });
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            if (this.isInstalledOnBrowser()) {
                return _super.getAddress.call(this);
            }
            if (utils.isMobile()) {
                utils.handleMobileWalletRedirect({
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

exports.PhantomInjected = PhantomInjected;
