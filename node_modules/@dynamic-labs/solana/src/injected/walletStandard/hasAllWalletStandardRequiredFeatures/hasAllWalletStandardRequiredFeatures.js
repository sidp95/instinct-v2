'use client'
const hasAllWalletStandardRequiredFeatures = (wallet, authMode = 'connect-and-sign') => {
    var _a, _b, _c, _d;
    const hasBasicFeatures = Boolean(((_a = wallet.features) === null || _a === void 0 ? void 0 : _a['standard:events']) &&
        ((_b = wallet.features) === null || _b === void 0 ? void 0 : _b['standard:connect']) &&
        ((_c = wallet.features) === null || _c === void 0 ? void 0 : _c['solana:signTransaction']));
    const hasAuthModeFeatures = authMode === 'connect-and-sign'
        ? Boolean((_d = wallet.features) === null || _d === void 0 ? void 0 : _d['solana:signMessage'])
        : true;
    return hasBasicFeatures && hasAuthModeFeatures;
};

export { hasAllWalletStandardRequiredFeatures };
