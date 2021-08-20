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
  // Handle modifies
  for (const key in b) {
    // eslint-disable-next-line no-prototype-builtins
    if (b.hasOwnProperty(key)) {
      if (typeof a[key] == `object`) {
        // Do not update the reference
        overwriteObject(a[key], b[key]);
      } else {
        a[key] = b[key];
      }
    }
  }
}

module.exports = overwriteObject;