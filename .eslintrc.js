module.exports = {
  "env": {
    "es6": true,
    "node": true
  },
  "parserOptions": {
    "sourceType": `module`,
    "ecmaVersion": 2020
  },

  "extends": `eslint:recommended`,
  "rules": {
    "quotes": [1, `backtick`],

    "indent": [`error`, 2],
    "no-trailing-spaces": [`error`, { "skipBlankLines": false }],
    "semi": [`error`, `always`],
  }
};