'use client'
import { assertPackageVersion } from '@dynamic-labs/assert-package-version';
import { version } from '../package.js';
export { getSignClientSingleton } from './getSignClientSingleton/getSignClientSingleton.js';

assertPackageVersion('@dynamic-labs/wallet-connect', version);
