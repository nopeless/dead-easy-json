'use strict';
const isSerializable = require(`../src/util/isSerializable`);
const overwriteObject = require(`../src/util/overwriteObject`);
const util = require(`util`);

// eslint-disable-next-line no-unused-vars
const {expect, assert } = require(`chai`);

describe(`Util functions`, function () {
  describe(`isSerializable()`, function () {
    const serializables = [
      {},
      [[1],2],
      [1, 2, 3],
      { a: 1, b: 2, c: 3 },
      { a: { b: { c: { d: 1 } } } },
      true,
      false,
      null,
      ``,
      1,
      undefined,
      new Date(),
      new String(`test`), // This is technically not allowed, but a case that is checked anyway
      new Boolean(true), // This as well
      new Number(1),
      /i am a regex/igms,
    ];
    const nonSerializables = [
      new ArrayBuffer(4),
      new Map([[1, 2], [3, 4]]),
      { a: { b: new Function(`return 1;`)}},
      new Set([1, 2, 3]),
      new Promise(function (resolve) {
        resolve(1);
      }),
      new Error(`test`),
      new Function(`return 1;`),
      [1,2, new Error(`test`)]
    ];
    function log(msg, s) {
      return `${msg}\n${util.format.apply(null, [s]).toString().replace(/[\n\r]/g, ` `)}`;
    }
    describe(`Should serialize`, function () {
      for (const s of serializables) {
        it(`${s}`.replace(/[\n\r]/g, ` `), function () {
          expect(isSerializable(s), log(`Object is`, s)).to.be.true;
        });
      }
    });
    describe(`Should not serialize`, function () {
      for (const s of nonSerializables) {
        it(`${s}`.replace(/[\n\r]/g, ` `), function () {
          expect(isSerializable(s), log(`Object is`, s)).to.be.false;
        });
      }
    });
  });
  describe(`overwriteObject()`, function () {
    it(`Should persist references`, function () {
      const obj = {
        a: `a`,
        b: `b`,
        c: `c`,
        d: {
          e: `e`
        }
      };
      const newObj = {
        a: `a`, // no change
        // b: 2, deleted
        c: `cc`, // changed
        d: {
          e: `ee` // changed
        },
        f: `f` // added
      };
      const newObjCopy = {
        ...newObj,
      };
      const propertyD = obj.d;
      overwriteObject(obj, newObj);
      expect(newObj).to.deep.equal(newObjCopy);
      // The reference should not have changed
      expect(obj.d).to.equal(propertyD);
    });
    it(`Should not allow [] to {}`, function () {
      const obj = {
        a: []
      };
      const newObj = {
        a: {}
      };
      expect(() => overwriteObject(obj, newObj)).to.throw(/not compatible/i);
    });
    it(`Should not allow {} to []`, function () {
      const obj = {
        a: {}
      };
      const newObj = {
        a: []
      };
      expect(() => overwriteObject(obj, newObj)).to.throw(/not compatible/i);
    });
    it(`Should properly reindex arrays without losing reference`, function () {
      const obj = {
        a: [2,3,4,5,6]
      };
      const newObj = {
        a: [1,2,3]
      };
      const ref = obj.a;
      overwriteObject(obj, newObj);
      expect(ref).to.deep.equal([1,2,3]);
    });
  });
});