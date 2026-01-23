'use client'
import { TurnkeyWalletConnectorInfo } from '@dynamic-labs/embedded-wallet';
import { TurnkeySolanaWalletConnector } from './lib/TurnkeySolanaWalletConnector/TurnkeySolanaWalletConnector.js';

const TurnkeySolanaWalletConnectors = (props) => {
    var _a;
    if ((_a = props.apiProviders) === null || _a === void 0 ? void 0 : _a.turnkey) {
        const TurnkeySolanaWalletConnectorConstructor = class extends TurnkeySolanaWalletConnector {
            constructor(innerProps) {
                super(TurnkeyWalletConnectorInfo.TurnkeyHD, Object.assign(Object.assign({}, props), innerProps));
            }
        };
        Object.defineProperty(TurnkeySolanaWalletConnectorConstructor, 'key', {
            value: 'turnkeyhd',
            writable: false,
        });
        return [TurnkeySolanaWalletConnectorConstructor];
    }
    return [];
};

export { TurnkeySolanaWalletConnectors };
