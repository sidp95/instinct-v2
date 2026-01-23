/**
 * Clear the redirect link phantom will use to return to the dapp
 *
 * This is necessary because the redirect link is used to return to the dapp
 * and it contains params that cause issues when the SDK is loading.
 * For example the redirect may include the errorCode or errorMessage which
 * will cause the SDK to throw an error and not complete the redirect.
 */
export declare const clearRedirectUrlForPhantom: (url: URL) => string;
