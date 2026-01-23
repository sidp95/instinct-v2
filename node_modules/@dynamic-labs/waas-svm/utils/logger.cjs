'use client'
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var logger$1 = require('@dynamic-labs/logger');

const logger = new logger$1.Logger('@dynamic-labs/waas-svm');

Object.defineProperty(exports, 'Logger', {
	enumerable: true,
	get: function () { return logger$1.Logger; }
});
exports.logger = logger;
