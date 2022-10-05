const {compileTests, getRuleTester} = require('../utils.js');

const rule = require('../../../lib/rules/let-const-on-top');

const testSets = {
  all: () => {
    return {
      valid: [
        {
          name: 'let / const are on top',
          code: `
            () => {
              let x;
              const y = 0x808;

              1;

              return y;
            };
          `
        },
        {
          name: 'var declarations are ignored',
          code: `
            () => {
              let x;
              var w;
              const y = 0xF00BA7;

              1;

              var z;
            };
          `
        },
        {
          name: 'Program scope is ignored',
          code: `
            let x;
            const y = 0xDECAFBAD;

            1;

            let z;
          `
        },
      ],

      invalid: [
        {
          name: 'let / const are not on top',
          code: `
            () => {
              let x;
              const y = 0xDEADBEEF;

              1;

              let z;
            };
          `,
          errors: 1
        },
        {
          name: 'let / const are not on top in inner scope',
          code: `
            () => {
              while (true) {
                1;
                let x;
              }
            };
          `,
          errors: 1
        },
      ]
    };
  }
};

getRuleTester().run('let-const-on-top', rule, compileTests(testSets));
