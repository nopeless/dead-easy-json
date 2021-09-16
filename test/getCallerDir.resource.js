'use strict';
const getCallerFile = require(`../src/util/getCallerDir`);

module.exports = () => getCallerFile();