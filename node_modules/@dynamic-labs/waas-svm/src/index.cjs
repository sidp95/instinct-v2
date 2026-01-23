'use client'
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var assertPackageVersion = require('@dynamic-labs/assert-package-version');
var _package = require('../package.cjs');
var DynamicWaasSVMConnector = require('./connector/DynamicWaasSVMConnector.cjs');
var DynamicWaasSvmConnectors = require('./DynamicWaasSvmConnectors.cjs');

assertPackageVersion.assertPackageVersion('@dynamic-labs/waas-svm', _package.version);

exports.DynamicWaasSVMConnector = DynamicWaasSVMConnector.DynamicWaasSVMConnector;
exports.DynamicWaasSVMConnectors = DynamicWaasSvmConnectors.DynamicWaasSVMConnectors;
