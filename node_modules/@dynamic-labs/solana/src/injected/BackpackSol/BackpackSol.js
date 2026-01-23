'use client'
import { __awaiter } from '../../../_virtual/_tslib.js';
import { bufferToBase64 } from '@dynamic-labs/utils';
import { findWalletBookWallet } from '@dynamic-labs/wallet-book';
import { InjectedWalletBase } from '../InjectedWalletBase/InjectedWalletBase.js';

class BackpackSol extends InjectedWalletBase {
    constructor(props) {
        super(props);
        this.name = 'Backpack';
        this.overrideKey = 'backpacksol';
        this.walletConnectWalletBookEntry = findWalletBookWallet(props.walletBook, this.key);
    }
    getSigner() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            return (_a = this.solProviderHelper) === null || _a === void 0 ? void 0 : _a.connect();
        });
    }
    signMessage(messageToSign) {
        return __awaiter(this, void 0, void 0, function* () {
            const publicAddress = yield this.getAddress();
            if (!publicAddress) {
                return undefined;
            }
            const provider = yield this.getSigner();
            if (!provider) {
                return undefined;
            }
            const signedMessage = yield provider.signMessage(Buffer.from(messageToSign, 'utf8'));
            if (!signedMessage) {
                return undefined;
            }
            if (typeof signedMessage === 'object' && 'signature' in signedMessage) {
                return bufferToBase64(signedMessage.signature);
            }
            return bufferToBase64(signedMessage);
        });
    }
}
Object.defineProperty(BackpackSol, 'key', {
    value: 'backpacksol',
    writable: false,
});

export { BackpackSol };
