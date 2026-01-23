'use client'
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var app = require('@wallet-standard/app');

const getWalletStandardWallets = () => {
    const { get, on } = app.getWallets();
    return {
        on,
        wallets: get(),
    };
};

exports.getWalletStandardWallets = getWalletStandardWallets;
