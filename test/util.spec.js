'use strict';
const isSerializable = require(`../src/util/isSerializable`);
const util = require(`util`);

// eslint-disable-next-line no-unused-vars
const {expect, assert } = require(`chai`);

describe(`Util functions`, function () {
  describe(`isSerializable`, function () {
    it(`Should work`, function () {
      const serializables = [
        {},
        [],
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
        new String(`test`),
        new Boolean(true),
        new Number(1),
        new ArrayBuffer(4), // wtf???
      ];
      const nonSerializables = [
        new Map([[1, 2], [3, 4]]),
        { a: { b: new Function(`return 1;`)}},
        new Set([1, 2, 3]),
        new Promise(function (resolve) {
          resolve(1);
        }),
        new Error(`test`),
        new Function(`return 1;`),
      ];
      function log(msg, s) {
        return `${msg}\n${util.format.apply(null, [s])}`;
      }
      for (const s of serializables) {
        expect(isSerializable(s), log(`Object is`, s)).to.be.true;
      }
      for (const s of nonSerializables) {
        expect(isSerializable(s), log(`Object is`, s)).to.be.false;
      }
    });
  });
});