module.exports = {
  'root': true,

  'parser': 'typescript-eslint-parser',

  'plugins': [
    'typescript'
  ],

  'extends': [
    '@nighttrax'
  ],

  'rules': {
    // ESLint doesn't understand interfaces yet and marks them as undefined.
    'no-undef': 0,

    'typescript/no-unused-vars': 2
  }
};
