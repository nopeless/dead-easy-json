'use strict';
const DejFunc =  require(`../src/index.js`);
const Dej = DejFunc(__dirname);
console.log(__dirname );
const fs = require(`fs`);
// eslint-disable-next-line no-unused-vars
const {expect, assert } = require(`chai`);

function deepEqual(a, b) {
  expect(a).to.deep.equal(b);
}

describe(`Main - Blank file each time`, function() {
  const filePath = `${__dirname}/file.json`;
  const fileAsJson = () => {
    return JSON.parse(fs.readFileSync(filePath, {encoding: `utf-8`}));
  };
  beforeEach(function() {
    fs.writeFileSync(filePath, ``);
  });
  after(function() {
    // Recursively check if any of the test failed
    let topParent = this.currentTest;
    while (topParent.parent) topParent = topParent.parent;
    function isFailed(suite) {
      // Suites are recursive
      for(const s of suite.suites) {
        return isFailed(s);
      }
      // Tests are not
      for (const test of suite.tests) {
        if (test.state === `failed`) return true;
      }
      return false;
    }
    const failed = isFailed(topParent);
    if (failed) {
      console.log(`Preserving dummy file`);
    } else {
      console.log(`Deleting dummy file`);
      // TODO: fix this
      // fs.unlinkSync(filePath);
    }
  });
  it(`Should give a helpful message when invoked without dirname`, function() {
    expect(DejFunc.require).to.throw(/forg[eo]t/i);
  });
  it(`A blank file should be {} by default`, function() {
    Dej.require(`file.json`);
    deepEqual(fileAsJson(), {});
  });
  it(`Should be a custom Object if set`, function() {
    Dej.require(`file.json`, []);
    deepEqual(fileAsJson(), []);
  });
  describe(`Array manipulation`, function() {
    before(function() {
      fs.writeFileSync(filePath, ``);
      this.dej = Dej.require(`file.json`, []);
      const file = this.dej.file;
      this.file = file;
    });
    it(`Should be able to add to an array`, function() {
      // loop 100 times
      for (let i = 0; i < 100; i++) {
        this.file.push(i);
      }
      this.file[1] = `2`;
      expect(fileAsJson()).to.have.property(1, `2`);
      expect(fileAsJson()).to.be.length(100);
    });
    it(`Should be able to remove from an array`, function() {
      this.file.pop();
      expect(fileAsJson()).to.be.length(99);
    });
    it(`Should be able to remove from an array by index`, function() {
      this.file.splice(0, 1);
      expect(fileAsJson()).to.be.length(98);
    });
    it(`Should support rewrites`, function() {
      this.dej.file = [];
      this.file = this.dej.file;
      this.file.push([]);
      this.file[0].push(10);
      expect(fileAsJson()[0]).to.be.eql([10]);
    });
  });
  describe(`Object manipulation` , function() {
    before(function() {
      fs.writeFileSync(filePath, ``);
      this.dej = Dej.require(`file.json`, {});
      const file = this.dej.file;
      this.file = file;
    });
    it(`Should be able to add to an object`, function() {
      this.file.a = 10;
      expect(fileAsJson()).to.have.property(`a`, 10);
    });
    it(`Should be able to add to an object with object`, function() {
      this.file.a = { b: {}};
      this.file.a.b.c = 3;
      expect(fileAsJson().a.b).to.have.property(`c`, 3);
    });
    it(`Should allow 'in'`, function() {
      this.file.a = { b: {}};
      expect(() => `a` in this.file).to.not.throw();
    });
    it(`Should be able to remove from an object by key`, function() {
      this.file.a = 10;
      delete this.file.a;
      expect(fileAsJson()).to.not.have.property(`a`);
    });
    it(`Should be able to invoke isExtensible`, function() {
      this.file.a = 10;
      expect(() => Object.isExtensible(this.file.a)).to.not.throw();
    });
    it(`Should support rewrites`, function() {
      this.dej.file = {};
      this.file = this.dej.file;
      this.file.a={};
      this.file.a.b = 10;
      expect(fileAsJson().a.b).to.be.eql(10);
    });
  });
  describe(`Misc functions`, function() {
    before(function() {
      fs.writeFileSync(filePath, ``);
      class c {
        constructor() {
        }
      }
      this.c = c;
      const {file} =  Dej.require(`file.json`, {
        arr: [1,2,3],
        obj: {a: 1, b: 2, c: 3},
        func: () => {},
        cons: c
      });
      this.file = file;
    });
    it(`Object.setPrototypeOf should not be allowed`, function() {
      expect(() => {Object.setPrototypeOf(this.file, null);}).to.throw(/not support|use.+instead/i);
    });
    it(`Object.defineProperty should not be allowed`, function() {
      expect(() => {Object.defineProperty(this.file, `1`, {});}).to.throw(/not support|use.+instead/i);
    });
    it(`Object.defineProperty should not be allowed`, function() {
      expect(() => {Object.defineProperty(this.file, `1`, {});}).to.throw(/not support|use.+instead/i);
    });
    it(`constructor should not be allowed`, function() {
      expect(() => {this.file.cons = this.c;}).to.throw(/not support|use.+instead/i);
      // But somehow if they manage to get pass this
      // expect(() => {new this.file.cons;}).to.throw();
    });
    // TODO: fix this
    // it(`apply shouldn't be allowed`, function() {
    //   console.log(this.file);
    //   expect(() => {this.file.func.apply(null, []);}).to.throw(/not support|use.+instead/i);
    // });
  });
});
