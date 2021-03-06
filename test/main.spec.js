'use strict';
const JSONrequire =  require(`../src/index.js`);
const fs = require(`fs`);
const chai = require(`chai`);
chai.use(require(`chai-as-promised`));
const {expect } = chai;

const sleep = t => new Promise(r => setTimeout(r, t));

const filePath = `${__dirname}/file.json`;
describe(`Main - Blank file each time`, function() {
  const fileAsJson = () => {
    return JSON.parse(fs.readFileSync(filePath, {encoding: `utf-8`}));
  };
  beforeEach(function() {
    fs.writeFileSync(filePath, ``);
  });
  after(function() {
  // Recursively check if any of the test failed
    let topParent = this.test;
    while (topParent.parent) topParent = topParent.parent;
    function isFailed(suite) {
    // Suites are recursive
      for(const s of suite.suites) {
        if (isFailed(s)) return true;
      }
      // Tests are not
      for (const test of suite.tests) {
        if (test.state === `failed`) return true;
      }
      return false;
    }
    const failed = isFailed(topParent);
    if (failed) {
      console.log(` [FAIL] Test failed. Click here to see last state(make sure --bail is on) ${filePath}`);
    } else {
      console.log(` [OK] Tests passed (file is deleted)`);
      fs.unlinkSync(filePath);
    }
  });
  it(`Should throw deprecation error`, function() {
    expect(() => JSONrequire.require()).to.throw(/deprecated/i);
  });
  it(`Should give a helpful message await was called with no write interval set`, async function() {
    // require(`./file.json`);
    // console.log(require.resolve(`./file.json`));
    const handler = JSONrequire(`./file.json`, {});
    await expect(handler.writeAwait).to.be.rejectedWith(/awaited/i);
  });
  it(`Should allow close even with no watch option (coverage)`, function() {
    const handler = JSONrequire(`./file.json`, {});
    handler.close();
  });
  it(`Should not allow unrecognized config entry`, function() {
    expect(() => {
      JSONrequire(`./file.json`, {}, {
        bad: `bad`
      });
    }).to.throw(/unrecognized/i);
  });
  it(`Should recognize previous data with no config`, function() {
    fs.writeFileSync(filePath, `{"test":1}`);
    const {file} = JSONrequire(`./file.json`);
    expect(file).to.deep.equal({test: 1});
  });
  it(`Should recognize previous data with same config`, function() {
    fs.writeFileSync(filePath, `{"test":1}`);
    const {file} = JSONrequire(`./file.json`, {});
    expect(file).to.deep.equal({test: 1});
  });
  it(`Should work with no default obj but config`, function() {
    fs.writeFileSync(filePath, `{"test":1}`);
    const {file} = JSONrequire(`./file.json`, undefined, {});
    expect(file).to.deep.equal({test: 1});
  });
  it(`Should throw error for different config type`, function() {
    fs.writeFileSync(filePath, `{"test":1}`);
    expect(() => JSONrequire(`./file.json`, [])).to.throw(/match/i);
  });
  it(`Should not allow primitives`, function() {
    fs.writeFileSync(filePath, `1`);
    expect(() => JSONrequire(`./file.json`, 3)).to.throw(/type/i);
  });
  it(`A blank file should be {} by default`, function() {
    JSONrequire(filePath);
    expect(fileAsJson()).to.deep.equal({});
  });
  it(`File with {} already written should be recognized`, function() {
    fs.writeFileSync(filePath, `{}`);
    JSONrequire(filePath);
    expect(fileAsJson()).to.deep.equal({});
  });
  it(`File with [] already written should be recognized`, function() {
    fs.writeFileSync(filePath, `[]`);
    JSONrequire(filePath);
    expect(fileAsJson()).to.deep.equal([]);
  });
  it(`Should be a custom Object if set`, function() {
    JSONrequire(filePath, [1]);
    expect(fileAsJson()).to.deep.equal([1]);
  });
  it(`Should properly use custom Object`, function() {
    const { file } = JSONrequire(filePath, [[]]);
    file[0].push(1);
    expect(fileAsJson()).to.deep.equal([[1]]);
  });
  describe(`Async interval`, function() {
    it(`Should write the function after some time`, async function() {
      this.slow(500);
      const req = JSONrequire(filePath, {}, {writeInterval: 100});
      const f = req.file;
      f.a = 1;
      expect(fileAsJson()).to.deep.equal({});
      await req.writeAwait;

      expect(fileAsJson()).to.deep.equal({a: 1});
    });
    it(`Should return a resolved promise if there is no queue`, function() {
      return new Promise((res, rej) => {
        this.slow(500);
        const req = JSONrequire(filePath, {}, {writeInterval: 100});
        // Now, this should be a race
        const a = req.writeAwait;
        a.then(res);
        sleep(50).then(() => rej(new Error(`writeAwait was not resolved in time`)));
      });
    });
    it(`Should stack the writes when there are multiple requests`, async function() {
      this.slow(500);
      const req = JSONrequire(filePath, [], {writeInterval: 100});
      const f = req.file;
      // loop a thousand times
      // This is normally not a good idea when stuff is synchronous, but its allowed here
      for (let i = 0; i < 1000; i++) {
        f[i] = i;
      }
      expect(fileAsJson()).to.deep.equal([]);
      await req.writeAwait;
      expect(fileAsJson()).to.have.length(1000);
    });
  });
  describe(`Array manipulation`, function() {
    before(function() {
      fs.writeFileSync(filePath, ``);
      this.dej = JSONrequire(filePath, []);
      const file = this.dej.file;
      this.file = file;
    });
    it(`Should be able to add to an array`, function() {
      // loop 10 times
      for (let i = 0; i < 10; i++) {
        this.file.push(i);
      }
      this.file[1] = `2`;
      expect(fileAsJson()).to.have.property(1, `2`);
      expect(fileAsJson()).to.be.length(10);
    });
    it(`Should be able to remove from an array`, function() {
      this.file.pop();
      expect(fileAsJson()).to.be.length(9);
    });
    it(`Should be able to remove from an array by index`, function() {
      this.file.splice(0, 1);
      expect(fileAsJson()).to.be.length(8);
    });
    it(`Should support rewrites`, function() {
      this.dej.file = [];
      this.file = this.dej.file;
      this.file.push([]);
      this.file[0].push(10);
      expect(fileAsJson()[0]).to.deep.equal([10]);
    });
  });
  describe(`Object manipulation` , function() {
    before(function() {
      fs.writeFileSync(filePath, ``);
      this.dej = JSONrequire(filePath, {});
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
      expect(fileAsJson().a.b).to.deep.equal(10);
    });
    it(`Should support complex default objects`, function() {
      this.dej.file = {a:{b:{}}};
      this.file = this.dej.file;
      this.file.a.b = 10;
      expect(fileAsJson().a.b).to.deep.equal(10);
    });
    it(`Should support changing of complex objects`, function() {
      this.dej.file = {a:{b:{}}};
      this.file = this.dej.file;
      this.file.a.b = 10;
      expect(fileAsJson().a.b).to.deep.equal(10);
      this.dej.file = [[10]];
      this.file = this.dej.file;
      this.file[0].push(20);
      expect(fileAsJson()[0]).to.deep.equal([10, 20]);
    });
    it(`Should support async write`, async function() {
      this.dej.file = {};
      this.file = this.dej.file;
      this.file.a = 10;
      await this.dej.writeAsync();
      expect(() => Object.isExtensible(this.file.a)).to.not.throw();
    });
  });
  describe(`Watching for changes`, function() {
    this.slow(1000);
    before(async function() {
      fs.writeFileSync(filePath, ``);
      this.dej = JSONrequire(filePath, {}, {watch: true});
      const file = this.dej.file;
      this.file = file;
      this.awaitWrite = async function (content) {
        await sleep(100); // this is because of chokidar default interval is 100
        const p = new Promise(resolve => {
          this.dej.watchCallback = resolve;
        });
        fs.writeFileSync(filePath, content);
        await p;
      };
    });
    after(async function() {
      await this.dej.close();
    });
    it(`Should allow direct call of watch callback (coverage)`, function () {
      this.dej.watchCallback();
    });
    it(`Should be able to watch for changes`, async function() {
      await this.awaitWrite(`{"a":{"b":3}}`);
      expect(this.file).to.deep.equal({a:{b:3}});
      await this.awaitWrite(`{"a":{"b":4}}`);
      expect(this.file).to.deep.equal({a:{b:4}});
    });
    it(`Simulate editor blank save case`, async function() {
      // vsc for example does this
      // The below function will trigger a console.error
      const e = console.error;
      console.error = () => {};
      await this.awaitWrite(``);
      console.error = e;
      await this.awaitWrite(`{"a":{"b":4}}`);
      expect(this.file).to.deep.equal({a:{b:4}});
    });
    it(`Should have a 5ms cooldown (coverage test)`, async function() {
      fs.writeFileSync(filePath, `{"a":{"b":3}}`);
      this.dej.writing = false; // Force overwrite
      fs.writeFileSync(filePath, `{"a":{"b":3}}`);
    });
    it(`Should persist in reference`, async function() {
      const ref = this.file.a;
      await this.awaitWrite(`{"a":{"b":4}}`);
      expect(ref.b).to.equal(4);
    });
    it(`Should error if file is invalid`, async function() {
      // This should console.error by default, but we override it
      return new Promise(resolve => {
        this.dej.onFileSaveError = resolve;
        this.awaitWrite(`{"a`);
      });
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
      const {file} =  JSONrequire(filePath, {
        arr: [1,2,3],
        obj: {a: 1, b: 2, c: 3},
        // func: () => {},
        // cons: c
      });
      this.file = file;
    });
    it(`Object.setPrototypeOf should not be allowed`, function() {
      expect(() => {Object.setPrototypeOf(this.file, null);}).to.throw(/not support|use.+instead/i);
    });
    it(`Object.defineProperty should not be allowed`, function() {
      expect(() => {Object.defineProperty(this.file, `1`, {});}).to.throw(/not support|use.+instead/i);
    });
    it(`constructor should not be allowed`, function() {
      expect(() => {this.file.cons = this.c;}).to.throw(/not support|use.+instead/i);
      // But somehow if they manage to get pass this
      // expect(() => {new this.file.cons;}).to.throw();
    });
    it(`Accessing prototype should be allowed`, function() {
      expect(() => {Object.getPrototypeOf(this.file.obj);}).to.not.throw();
    });
    it(`Accessing isExtensible should be allowed`, function() {
      expect(() => {Object.isExtensible(this.file.obj);}).to.not.throw();
    });
    it(`Accessing keys should be allowed`, function() {
      expect(() => {Object.keys(this.file.obj);}).to.not.throw();
    });
    it(`Accessing bool value preventExtensions should be allowed`, function() {
      expect(() => {Object.preventExtensions(this.file.obj);}).to.not.throw();
    });
    it(`Accessing keys should be allowed`, function() {
      expect(() => {Object.keys(this.file.obj);}).to.not.throw();
    });
    it(`Writing non-negative values to Array should not be allowed`, function() {
      expect(() => {this.file.arr.a = 42;}).to.throw(/non-negative/i);
    });
  });
});
