'use strict';
const fs = require(`fs`);

let readme = fs.readFileSync(`README.md`).toString();

const re = /<!--INJECT ((?:(?!-->).)+?)-->.+?<!--END \1-->/gs;
const renog = /<!--INJECT ((?:(?!-->).)+?)-->.+?<!--END \1-->/s;
readme = readme.replace(re, m => {
  m = m.match(renog);
  const filename = m[1];
  const file = fs.readFileSync(filename);
  return `\`\`\`js\n${file}\`\`\``;
});

fs.writeFileSync(`README.md`, readme);