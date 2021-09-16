'use strict';
// https://stackoverflow.com/questions/16697791/nodejs-get-filename-of-caller-function
// Heavily modified
const path = require('path');

function _getCallerDir() {
  const originalFunc = Error.prepareStackTrace;

  const err = new Error();

  Error.prepareStackTrace = function (err, stack) { return stack; };

  err.stack.shift();
  const dir = path.dirname(err.stack.shift().getFileName());

  Error.prepareStackTrace = originalFunc;

  return dir;
}

module.exports = _getCallerDir;