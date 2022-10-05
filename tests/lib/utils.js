
const RuleTester = require('eslint').RuleTester;
const babelParserPath = require.resolve('@babel/eslint-parser');

const attachOptions = (tests, key, value) =>
  value ? tests.map(test => ({...test, [key]: test[key] || value})) : tests

const propagateOptions = (testSet, keys) => {
  keys.forEach(key => {
    ['valid', 'invalid'].forEach(block => {
      testSet[block] = attachOptions(testSet[block], key, testSet[key]);
    });
  });

  return testSet;
}

const getRuleTester = () => new RuleTester({parser: babelParserPath});

const compileTests = testSets => {

  // Compile the expected tests structure from the internal hierarchical test
  // sets structure. The latter is an object whose every value is a function
  // returning a test set containing `valid` and `invalid` test cases, and
  // the optional `options` and `filename` properties which are propagated
  // down to each test case, unless the test case defines its own property of
  // the same name. See:
  //
  // https://eslint.org/docs/latest/developer-guide/nodejs-api#ruletester

  return Object.values(testSets).reduce(
    (acc, makeTestSet) => {
      const testSet = propagateOptions(makeTestSet(), ['options', 'filename']);

      return {
        valid: [...acc.valid, ...testSet.valid],
        invalid: [...acc.invalid, ...testSet.invalid]
      };
    },
    {valid: [], invalid: []}
  );
}

module.exports = {
  compileTests,
  getRuleTester
};
