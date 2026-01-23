'use client'
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var SolanaWalletConnectConnector = require('../../SolanaWalletConnectConnector/SolanaWalletConnectConnector.cjs');

const getSolanaWalletConnectConnector = () => {
    const SolanaWalletConnectConnectorConstructor = class extends SolanaWalletConnectConnector.SolanaWalletConnectConnector {
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

exports.getSolanaWalletConnectConnector = getSolanaWalletConnectConnector;
