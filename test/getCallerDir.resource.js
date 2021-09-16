'use strict';
const getCallerFile = require(`../src/util/getCallerDir`);

module.exports.current = () => getCallerFile();
module.exports.correct = () => getCallerFile(__filename);