'use client'
import { getWalletMetadataFromWalletBook } from '@dynamic-labs/wallet-connector-core';
import { SolanaWalletConnectConnector } from '../../SolanaWalletConnectConnector/SolanaWalletConnectConnector.js';

/**
 * Adds Solana WalletConnect connectors to the list of connectors, avoiding duplicates
 * by checking what connectors are already present
 */
const addSolanaWalletConnectConnectors = ({ walletBook, connectors: currentConnectors, }) => {
    var _a;
    const walletEntries = Object.entries((_a = walletBook === null || walletBook === void 0 ? void 0 : walletBook.wallets) !== null && _a !== void 0 ? _a : {});
    const allWcConstructors = walletEntries
        .filter(([, wallet]) => {
        var _a;
        return wallet.walletConnect &&
            (
            // Exclude wallets that don't support Solana
            (_a = wallet.chains) === null || _a === void 0 ? void 0 : _a.some((chain) => chain.includes('solana:')));
    })
        .map(([key, wallet]) => {
        const { shortName } = wallet;
        const name = shortName || wallet.name;
        const SolanaWalletConnectConnectorConstructor = class extends SolanaWalletConnectConnector {
            constructor(props) {
                super(Object.assign(Object.assign({}, props), { metadata: getWalletMetadataFromWalletBook({
                        walletBook,
                        walletBookWallet: wallet,
                        walletKey: key,
                    }), overrideKey: key, walletName: name }));
                this.overrideKey = key;
            }
        };
        const entryKeysWithSameGroup = walletEntries
            .filter(([, { group }]) => group && group === wallet.group)
            .map(([key]) => key);
        // We store the key and the keys of all other entries in the same group
        // so that we can filter out from the WC connectors we just built both the ones
        // whose key is already present in the current connectors and the ones whose key is in the same group
        // as one of the current connectors.
        // We need to check the groups as well because the wallet book entry that we use to create the Sol WC
        // connector might be coming from the EVM wallet book entry (due to historical reasons, that's the entry
        // that has the WC data)
        Object.defineProperty(SolanaWalletConnectConnectorConstructor, 'key', {
            value: key,
            writable: false,
        });
        Object.defineProperty(SolanaWalletConnectConnectorConstructor, 'groupedKeys', {
            value: entryKeysWithSameGroup,
            writable: false,
        });
        return SolanaWalletConnectConnectorConstructor;
    });
    let filteredWcConstructors = allWcConstructors;
    if (currentConnectors.length > 0) {
        filteredWcConstructors = allWcConstructors.filter((constructor) => currentConnectors.every((existingConnector) => 
        // @ts-expect-error - the key type is not defined for the constructor
        existingConnector['key'] !== constructor['key'] &&
            // @ts-expect-error - the key type is not defined for the constructor
            !constructor['groupedKeys'].includes(existingConnector['key'])));
    }
    return [...currentConnectors, ...filteredWcConstructors];
};

export { addSolanaWalletConnectConnectors };
