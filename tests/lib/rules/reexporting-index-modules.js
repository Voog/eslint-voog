const {compileTests, getRuleTester} = require('../utils.js');

const rule = require('../../../lib/rules/reexporting-index-modules');

const testSets = {
  all: () => {
    return {
      valid: [
        {
          name:
            'Imports are sourced from the index module\'s directory',
          code: `
            import A from './A';
            import {Bx, By} from './B';
            import E from './C/D/E';
          `
        },
        {
          name: 'Only identifiers are exported',
          code: `
            import {Ax, Ay, Az} from './A'

            export default Ax;
            export {Ax, Ay, Az as B};
          `
        },
        {
          name: 'Re-exports are sourced from the module\'s directory',
          code: `
            export * from './F';
            export * as 'G' from './G';
            export * as 'J' from './H/I/J';
            export default from './K';
          `
        },
      ],

      invalid: [
        {
          name: 'Syntactic elements other than import or export declarations are encountered',
          code: `
            const foo = 0xf00;
            function quux() { };
            export default foo;
          `,
          errors: 3
        },
        {
          name: 'Imports from outside the module\'s directory are encountered',
          code: `
            import A from 'A';
            import B from '../B';
            import {Dx, Dy} from '@C/D';
          `,
          errors: 3
        },
        {
          name: 'Non-identifier exports are encountered',
          code: `
            export default () => 'bar';
            export const foo = 'quux';
          `,
          errors: 2
        },
        {
          name: 'Re-exports from outside the module\'s directory are encountered',
          code: `
            export {Ax, Ay} from '../A';
            export default from 'B';
          `,
          errors: 2
        },
      ],

      filename: 'app/Module/index.js'
    };
  }
};

getRuleTester().run('reexporting-index-modules', rule, compileTests(testSets));
