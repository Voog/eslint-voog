
## Testing

In your project, temporarily modify ESLint configuration so that `plugins`
includes `"voog"` and `rules` contains only

```
"voog/<RULE>": ["error"]
```

Then clone `eslint-voog`, link it to your project and run ESLint over the
codebase to inspect the results. Execute `yarn test` to run the test suite.

```
$ git clone git@github.com:Voog/eslint-voog.git
$ cd eslint-voog
$ git checkout <BRANCH>
$ yarn test
$ yarn link
$ cd /my/project
$ yarn link eslint-plugin-voog
$ npx eslint -- 'app/assets/javascripts/**/*.js'
```

