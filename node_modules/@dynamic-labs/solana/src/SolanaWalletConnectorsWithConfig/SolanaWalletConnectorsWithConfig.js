'use client'
import { SolanaWalletConnectors } from '../SolanaWalletConnectors.js';

/**
 * Allows passing in Solana connection configuration to all wallet connectors.
 */
const SolanaWalletConnectorsWithConfig = (connectionConfig) => {
    // Idea here is to ensure that all wallet connectors are constructed with
    // the client-provided connection configuration, so we "wrap" the constructors with it.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const classWithConfig = (className) => class extends className {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(...args) {
            const [opts] = args;
            super(Object.assign(Object.assign({}, opts), { connectionConfig }));
        }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (props) => SolanaWalletConnectors(props).map(classWithConfig);
};

export { SolanaWalletConnectorsWithConfig };
