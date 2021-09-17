'use strict';
function isWeakSerializable(obj) {
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
      return true;
    }
    if (obj instanceof String || obj instanceof Boolean || obj instanceof Number) {
      return true;
    }
    if (obj.toString() !== `[object Object]`) {
      return false;
    }
    return true;
  }
  // Other primitive types
  if (obj === null || type === `string` || type === `number` || type === `boolean` || obj === undefined) {
    return true;
  }
  return false;
}
module.exports = isWeakSerializable;