'use client'
import { SolanaWalletConnectConnector } from '../../SolanaWalletConnectConnector/SolanaWalletConnectConnector.js';

const getSolanaWalletConnectConnector = () => {
    const SolanaWalletConnectConnectorConstructor = class extends SolanaWalletConnectConnector {
        constructor(props) {
            super(Object.assign(Object.assign({}, props), { metadata: { groupKey: 'walletconnect', name: 'WalletConnect' }, walletName: 'WalletConnect Sol' }));
        }
    };
    Object.defineProperty(SolanaWalletConnectConnectorConstructor, 'key', {
        value: 'walletconnectsol',
        writable: false,
    });
    return SolanaWalletConnectConnectorConstructor;
};

export { getSolanaWalletConnectConnector };
