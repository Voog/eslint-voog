# eslint-plugin-voog

A collection of ESLint rules used at [Voog](https://voog.com/developers).

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-voog`:

```sh
npm install eslint-plugin-voog --save-dev
```

## Usage

Add `voog` to the plugins section of your `.eslintrc` configuration file. You
can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": [
    "voog"
  ]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "voog/enforce-import-ordering": [
      "error",
      {
        "blockOrder": [
          "foreign",
          "local",
          "constant"
        ],
        "blockMembershipTests": {
          "constant": {
            "namedTest": "constant"
          },
          "local": "^\\.\\.?/",
          "foreign": "^\\w+$"
        },
        "ignore": "/utils/",
        "checkImportsOnTop": true,
        "checkBlockSeparation": false
      }
    ]
  }
}
```

The preceding configuration would accept the following module:

```js
import React from 'react';
import cc from 'classcat';

import MyComponent from './MyComponent';
import FurtherComponent from '../elsewhere/FurtherComponent';

import {A_CONSTANT} from 'constants';

import {doStuff} from 'shared/utils/computations'; // this declaration ignored
```

but would not accept the following:

```js
import MyComponent from './MyComponent';
import {A_CONSTANT} from 'constants';
import FurtherComponent from '../elsewhere/FurtherComponent';

import React from 'react';
import cc from 'classcat';
```

You may choose to simply utilize the configuration we use internally at Voog:

```json
{
  "extends": ["plugin:voog/voog"]
}
```

## Supported rules

### `enforce-import-ordering`

A rule to enforce the following conditions:

- Import declarations must appear sorted into blocks defined by `blockOrder`
  and `blockMembershipTests`.
- Import declaration blocks must be separated by at least two newlines (unless
  `checkBlockSeparation` is explicitly set to false).
- Import declarations must appear before any other statements in a source file
  (unless `checkImportsOnTop` is explicitly set to false).

#### Configuration

* `blockOrder` _Array_ (required)

  An array of strings specifying an ordering of import declaration blocks. The
  strings are freely chosen to describe the import block, e.g. `"foreign"`,
  `"local"` or `"constant"`.

* `blockMembershipTests` _Object_ (required)

  An object whose keys are `blockOrder` members and whose values are regular
  expressions matched against the import source (the string signifying what to
  import, i.e. the final component of an import declaration), or named tests.
  Named tests are invoked by a structure `{"namedTest": <classifier>}` where
  `<classifier>` is a string referring to a built-in import declaration
  classifier.  Currently the only supported classifier is `constant` which
  matches if at least one of the imported symbols consists solely of uppercase
  characters or underscores and begins with an uppercase character. Note that:

  * Every `blockOrder` member is required to have a corresponding entry in
    `blockMembershipTests`.
  * The order of `blockMembershipTests` is significant, as the tests are
    matched in order and the import declaration is classified by the first
    match.

* `ignore` _Array_

   An array of regular expressions matched against the import source. Matching
   declarations are not classified and ignored.

* `checkBlockSeparation` _Boolean_

   If true, enforce the requirement that import declaration blocks must be
   separated by at least two newlines.

* `checkImportsOnTop` _Boolean_

   If true, enforce the requirement that every import declaration must appear
   before any other statement in the file. Defaults to true.
