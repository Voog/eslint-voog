# eslint-plugin-voog

Enforce order of import blocks

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
        "voog/enforce-import-ordering": ["error"]
    }
}
```

## Supported Rules

### enforce-import-ordering

A rule to enforce two conditions:

- Import declarations must appear before any other statements in a source file.
- Import declarations must appear sorted into the following blocks:
  - Foreign imports (generally from node_modules)
  - Local imports
  - Stylesheet imports (CSS)
  - Image imports (SVG, PNG, JPG)


