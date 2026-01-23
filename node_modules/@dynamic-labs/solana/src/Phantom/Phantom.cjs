'use client'
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _tslib = require('../../_virtual/_tslib.cjs');
var solanaCore = require('@dynamic-labs/solana-core');
var utils = require('@dynamic-labs/utils');
var PhantomInjected = require('../injected/PhantomInjected/PhantomInjected.cjs');
var PhantomRedirect = require('../phantomRedirect/PhantomRedirect/PhantomRedirect.cjs');

class Phantom extends solanaCore.SolanaWalletConnector {
    constructor() {
        super(...arguments);
        this.name = 'Phantom';
        this.overrideKey = 'phantom';
    }
    connect() {
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            yield this.getMobileOrInstalledWallet().connect();
        });
    }
    getSigner() {
        return _tslib.__awaiter(this, void 0, void 0, function* () {
            return this.getMobileOrInstalledWallet().getSigner();
        });
    }
    getMobileOrInstalledWallet() {
        const phantomInjected = new PhantomInjected.PhantomInjected(this.constructorProps);
        if (utils.isMobile() &&
            !phantomInjected.isInstalledOnBrowser() &&
            this.mobileExperience === 'redirect') {
            return new PhantomRedirect.PhantomRedirect(this.constructorProps);
        }
        return phantomInjected;
    }
}
Object.defineProperty(Phantom, 'key', {
    value: 'phantom',
    writable: false,
});

exports.Phantom = Phantom;
