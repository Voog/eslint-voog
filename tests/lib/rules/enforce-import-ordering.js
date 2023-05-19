const {compileTests, getRuleTester} = require('../utils.js');

const defaultConfig = require('../../../lib').configs.voog.rules['voog/enforce-import-ordering'][1];
const rule = require('../../../lib/rules/enforce-import-ordering')

const testSets = {
  ordering: () => {
    const options = {
      blockOrder: ['A', 'B'],
      blockMembershipTests: {
        A: '^A+',
        B: '^B+'
      },
      checkBlockSeparation: false
    };

    return {
      valid: [
        {
          name: 'Imports are in order',
          code: `
            import 'A';
            import 'AA';
            import 'AAA';
            import 'B';
            import 'BB';
            import 'BBB';
          `
        },
        {
          name: 'Imports are in order, with implicitly ignored declarations',
          code: `
            import 'ignored';
            import 'AA';
            import 'ignored';
            import 'AAA';
            import 'ignored';
            import 'B';
            import 'ignored';
            import 'BB';
            import 'ignored';
          `
        },
        {
          name: 'Explicitly ignored declarations are excluded from ordering enforcement',
          code: `
            import 'A';
            import 'AA';
            import 'AAA';
            import 'B';
            import 'AAA_ignored';
            import 'BBB';
          `,
          options: [{...options, ignore: ['AAA_ignored']}]
        },
      ],

      invalid: [
        {
          name: 'Imports are not in order',
          code: `
            import 'B';
            import 'A';
          `,
          errors: 1
        },
      ],

      options: [options]
    };
  },

  importsOnTop: () => {
    const options = {
      blockOrder: [],
      blockMembershipTests: {},
      checkImportsOnTop: true,
      checkBlockSeparation: false
    };

    return {
      valid: [
        {
          name: 'No other statement occurs before import declarations',
          code: `
            import 'A';
            import 'B';

            let x = 1;
          `
        },
      ],

      invalid: [
        {
          name: 'Another statement occurs before any import declarations',
          code: `
            let x = 1;

            import 'A';
            import 'B';
          `,
          errors: 1
        },
        {
          name: 'Another statement occurs before the final import declaration',
          code: `
            import 'A';

            let x = 1;

            import 'B';
          `,
          errors: 1
        },
      ],

      options: [options]
    }
  },

  blocksSeparated: () => {
    const options = {
      blockOrder: ['A', 'B'],
      blockMembershipTests: {
        A: '^A+$',
        B: '^B+$'
      },
      checkBlockSeparation: true,
      checkImportsOnTop: false
    };

    return {
      valid: [
        {
          name: 'Import blocks are separated by two newlines',
          code: `
            import 'A';
            import 'AA';

            import 'B';
            import 'BB';
          `
        },
        {
          name: 'Import blocks are separated by more newlines',
          code: `
            import 'A';
            import 'AA';


            import 'B';
            import 'BB';
          `
        },
        {
          name: 'Import blocks are separated by two newlines, with empty lines within a block',
          code: `
            import 'A';
            import 'AA';

            import 'B';

            import 'BB';
          `
        },
        {
          name: 'Import blocks are separated by newlines, a comment and a statement',
          code: `
            import 'A';
            import 'AA';

            // Lorem ipsum

            let x = 1;

            import 'B';
            import 'BB';
          `
        },
        {
          name: 'Ignored declarations are not taken into account for separation enforcement',
          code: `
            import 'A';
            import 'ignored';
            import 'AA';
            import 'ignored';

            import 'ignored';
            import 'B';
            import 'ignored';
            import 'BB';
          `
        }
      ],

      invalid: [
        {
          name: 'Import blocks are separated by no newlines',
          code: `
            import 'A'; import 'B';
          `,
          errors: 1
        },
        {
          name: 'Import blocks are separated by one newline',
          code: `
            import 'A';
            import 'B';
          `,
          errors: 1
        }
      ],

      options: [options]
    }
  },

  constantNamedTest: () => {
    const options = {
      blockOrder: ['constant', 'any'],
      blockMembershipTests: {
        constant: {namedTest: 'constant'},
        any: ''
      },
      checkBlockSeparation: true
    };

    return {
      valid: [
        {
          name: 'All declarations with only constant imports match the constant named test',
          code: `
            import CONSTANT_A from 'path';
            import {CONSTANT_B} from 'path';
            import CONSTANT_C, {CONSTANT_D} from 'path';
            import {CONSTANT_E, CONSTANT_F} from 'path';
          `
        }
      ],

      invalid: [
        {
          name: 'Declarations with some non-constant imports do not match the constant named test',
          code: `
            import CONSTANT_A from 'path';
            import Class, {CONSTANT_B} from 'path';
          `,
          errors: [{message: /must be separated/}]
        }
      ],

      options: [options]
    };
  },

  defaultConfig: () => {
    return {
      valid: [],

      invalid: [
        {
          name: 'Default config: actions and action utils are considered separate blocks',
          code: `
            import {action} from 'path/actions';
            import {actionUtil} from 'path/actions/utils';
          `,
          errors: 1
        }
      ],

      options: [defaultConfig]
    }
  },
};

getRuleTester().run('enforce-import-ordering', rule, compileTests(testSets));
