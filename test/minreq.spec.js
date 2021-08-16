'use strict';
const fs = require(`fs`);
const path = require(`path`);
// eslint-disable-next-line no-unused-vars
const {expect, assert } = require(`chai`);

describe(`Scripts in docs`, function () {
  const files = [
    [`Quickstart`, `quickstart.js`],
    [`A more controlled example`, `detailed.js`]
  ];
  for (const [fileDesc, fileName] of files) {
    describe(`'${fileDesc}' in 'docs'`, function () {
      it(`Should not error`, async function () {
        // I'm gonna do whats called a pro gamer move
        let file = fs.readFileSync(path.join(__dirname, `../docs/${fileName}`)).toString();
        let p;
        // remove console log file
        file = file.replace(/console\.log/g, ``);
        const code = `p = (async () => {\n${file}\n})().then(() => true).catch(e => {console.log(e); return false})`;
        eval(code);
        const res = await p;
        expect(res).to.be.true;
      });
    });
  }
});