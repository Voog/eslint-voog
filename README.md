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

Add `voog` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

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
        "voog/rule-name": 2
    }
}
```

## Supported Rules

* Fill in provided rules here


