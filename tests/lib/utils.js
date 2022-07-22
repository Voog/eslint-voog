
const RuleTester = require('eslint').RuleTester;

const attachOptions = (tests, options) =>
  options ? tests.map(test => ({...test, options: [test.options || options]})) : tests

const getRuleTester = () =>
  new RuleTester({parserOptions: {ecmaVersion: 2022, sourceType: 'module'}});

const compileTests = testSets => {

  // Compile the expected tests structure from the internal hierarchical test
  // sets structure. The latter is an object whose every value is a function
  // returning a test set containing `valid` and `invalid` test cases, and:
  //
  // - options - common options applied to each test case, unless the test
  //   case has its own `options`

  return Object.values(testSets).reduce(
    (acc, makeTestSet) => {
      const testSet = makeTestSet();
      const valid = attachOptions(testSet.valid, testSet.options);
      const invalid = attachOptions(testSet.invalid, testSet.options);

      return {
        valid: [...acc.valid, ...valid],
        invalid: [...acc.invalid, ...invalid]
      };
    },
    {valid: [], invalid: []}
  );
}

module.exports = {
  compileTests,
  getRuleTester
};
