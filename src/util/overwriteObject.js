'use strict';

function overwriteObject (a, b) {
  // Write b on top of a
  // Only handle with deletes
  for (const key in a) {
    // eslint-disable-next-line no-prototype-builtins
    if (!b.hasOwnProperty(key)) {
      delete a[key];
    }
  }

  // Some useful checks
  if (Array.isArray(a) && !Array.isArray(b) || !Array.isArray(a) && Array.isArray(b)) {
    throw new Error(`${a} is not compatible with ${b}`);
  }

  // If a is an Array, update by indices
  if (Array.isArray(a) && Array.isArray(b)) {
    // Delete the keys
    for (const k in a) {
      delete a[k];
    }
    const keys = Object.keys(b);
    for (let i = 0; i < keys.length; i++) {
      a[i] = b[i];
    }
    a.length = keys.length;
    return;
  }

  // Handle modifies
  for (const key in b) {
    // eslint-disable-next-line no-prototype-builtins
    if (b.hasOwnProperty(key)) {
      if (typeof a[key] === `object` && a[key] !== null) {
        // Do not update the reference
        overwriteObject(a[key], b[key]);
      } else {
        a[key] = b[key];
      }
    }
  }
}

module.exports = overwriteObject;