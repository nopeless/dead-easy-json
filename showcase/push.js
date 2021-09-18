const handler = require(`../src/index.js`)(`./file.json`, {});
const file = handler.file;

let obj = {};
file.test = obj;

obj.prop = 3;