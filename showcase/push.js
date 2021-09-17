const handler = require(`../src/index.js`)(`./file.json`, {});
const file = handler.file;

let obj = {
  prop:[],
};
file.test = obj;
// obj.prop = [1,2]; // doesn't work
obj.prop.push(42); // works

obj = file.test;
obj.prop = 42; // works
obj.someattr = `hi`; // works