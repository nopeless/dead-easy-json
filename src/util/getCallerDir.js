'use strict';
// https://stackoverflow.com/questions/16697791/nodejs-get-filename-of-caller-function
// Heavily modified
const path = require('path');

function _getCallerDir(current) {
  if (!current) throw new Error(`current file path not provided`);
  const originalFunc = Error.prepareStackTrace;
  const err = new Error();
  Error.prepareStackTrace = function (err, stack) { return stack; };

  err.stack.shift();
  let file = err.stack.shift().getFileName();
  while (!file || file === current) {
    file = err.stack.shift().getFileName();
  }

  Error.prepareStackTrace = originalFunc;
  return path.dirname(file);
}

module.exports = _getCallerDir;