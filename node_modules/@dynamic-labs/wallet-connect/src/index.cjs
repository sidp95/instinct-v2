'use client'
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var assertPackageVersion = require('@dynamic-labs/assert-package-version');
var _package = require('../package.cjs');
var getSignClientSingleton = require('./getSignClientSingleton/getSignClientSingleton.cjs');

assertPackageVersion.assertPackageVersion('@dynamic-labs/wallet-connect', _package.version);

exports.getSignClientSingleton = getSignClientSingleton.getSignClientSingleton;
