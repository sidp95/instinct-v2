'use client'
import { assertPackageVersion } from '@dynamic-labs/assert-package-version';
import { version } from '../package.js';
export { DynamicWaasSVMConnector } from './connector/DynamicWaasSVMConnector.js';
export { DynamicWaasSVMConnectors } from './DynamicWaasSvmConnectors.js';

assertPackageVersion('@dynamic-labs/waas-svm', version);
