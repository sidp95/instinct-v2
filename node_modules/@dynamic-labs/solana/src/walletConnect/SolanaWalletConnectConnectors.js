'use client'
import { addSolanaWalletConnectConnectors } from './utils/addSolanaWalletConnectConnectors/addSolanaWalletConnectConnectors.js';

/**
 * Returns ALL Solana WalletConnect connectors from the wallet book.
 *
 * WARNING: This should only be used if you have no other Solana connectors.
 * If you have other Solana connectors, you should use addSolanaWalletConnectConnectors instead.
 */
const SolanaWalletConnectConnectors = (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
props) => addSolanaWalletConnectConnectors({
    connectors: [],
    walletBook: props.walletBook,
});

export { SolanaWalletConnectConnectors };
