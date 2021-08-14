'use strict';
function isSerializable(obj) {
  var type = typeof obj;
  if (type === `object`) {
    if (obj === null) {
      return true;
    }
    if (obj instanceof Date) {
      return true;
    }
    if (obj instanceof RegExp) {
      return true;
    }
    if (obj instanceof Array) {
      for (var i = 0; i < obj.length; i++) {
        if (!isSerializable(obj[i])) {
          return false;
        }
      }
      return true;
    }
    // TODO: tidy this check because javascript is ret**ded
    if (obj instanceof Map || obj instanceof Set || obj instanceof Promise || obj instanceof WeakMap || obj instanceof WeakSet || obj instanceof Error || obj instanceof Function || obj instanceof Symbol) {
      return false;
    }
    if (obj instanceof Object) {
      for (var key in obj) {
        // eslint-disable-next-line no-prototype-builtins
        if (obj.hasOwnProperty(key)) {
          if (!isSerializable(obj[key])) {
            return false;
          }
        }
      }
      return true;
    }
  }
  // Other primitive types
  if (obj === null || type === `string` || type === `number` || type === `boolean` || obj === undefined) {
    return true;
  }
  return false;
}
module.exports = isSerializable;