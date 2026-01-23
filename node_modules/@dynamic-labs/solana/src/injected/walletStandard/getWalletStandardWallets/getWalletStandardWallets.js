'use client'
import { getWallets } from '@wallet-standard/app';

const getWalletStandardWallets = () => {
    const { get, on } = getWallets();
    return {
        on,
        wallets: get(),
    };
};

export { getWalletStandardWallets };
