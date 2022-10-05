const requireIndex = require('requireindex');

module.exports = {
  rules: requireIndex(__dirname + '/rules'),
  configs: {
    voog: {
      plugins: ['voog'],
      rules: {
        'voog/enforce-import-ordering': [
          'error',
          {
            blockOrder: [
              'foreign',
              'local',
              'component-local',
              'action',
              'util',
              'constant',
              'image',
              'css'
            ],
            blockMembershipTests: {
              action: '(^|/)actions(/|\\.js|$)',
              util: '(^|/)utils(/|\\.js|$)',
              constant: {namedTest: 'constant'},
              image: '\\.(svg|png|jpe?g)(\\?\\w+)?$',
              css: '\\.css(\\?\\w+)?$',
              'component-local': '^\\./',
              local: '^(\\.\\.|~[\\w~]+|shared|ecommerce)',
              foreign: '^((@|lodash/).*|[\\w-]+)$'
            },
            ignore: ['utils/[A-Z]', '^\\./[a-z]']
          }
        ],
        'voog/let-const-on-top': ['error'],
        'voog/reexporting-index-modules': ['error']
      }
    }
  }
};
