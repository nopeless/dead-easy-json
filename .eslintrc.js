module.exports = {
  "env": {
    "es6": true,
    "node": true
  },

  "extends": `eslint:recommended`,
  "rules": {
    "quotes": [1, `backtick`],

    "indent": [`error`, 2],
    "no-trailing-spaces": [`error`, { "skipBlankLines": false }],
    "semi": [`error`, `always`],
  }
};