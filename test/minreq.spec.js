'use strict';
const fs = require(`fs`);
const path = require(`path`);
// eslint-disable-next-line no-unused-vars
const chai = require(`chai`);
const {expect, assert } = chai;
chai.use(require(`chai-as-promised`));

describe(`Scripts in docs`, function () {
  beforeEach(function () {
    fs.writeFileSync(`${__dirname}/myJson.json`, ``);
  });
  const files = [
    [`Quickstart`, `quickstart.js`],
    [`A more controlled example`, `detailed.js`]
  ];
  for (const [fileDesc, fileName] of files) {
    const absdir = path.join(__dirname, `../docs/${fileName}`);
    describe(`'${fileDesc}' in 'docs' (${absdir})`, function () {
      it(`Should not error`, async function () {
        this.slow(500);
        // I'm gonna do whats called a pro gamer move
        let file = fs.readFileSync(absdir).toString();
        let p;
        // remove console log file
        file = file.replace(/console\.log/g, ``);
        file = file.replace(/dead-easy-json/g, `../src/index.js`);
        const code = `p = (async () => {\n${file}\n})().then(() => true).catch(e => {console.log(e); return false})`;
        eval(code);
        expect(await p).to.be.true;
      });
    });
  }
});