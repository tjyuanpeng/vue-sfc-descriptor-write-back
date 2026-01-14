# vue-sfc-descriptor-write-back

A lightweight utility to parse Vue Single-File Components (SFC) and write modified SFCDescriptor back to the original source code, preserving non-block content (comments, whitespace) and maintaining correct offset positions.

## Features

- Parse Vue SFC files into SFCDescriptor (powered by @vue/compiler-sfc)
- Write modified SFCDescriptor back to the original source code
- Preserve non-block content (comments, whitespace outside template/script/style)
- Efficiently update only changed blocks using offset-based overwrites (via MagicString)
- Type-safe API with full TypeScript support

## Installation

```shell
# pnpm (recommended)
pnpm add vue-sfc-descriptor-write-back

# npm
npm install vue-sfc-descriptor-write-back

# yarn
yarn add vue-sfc-descriptor-write-back
```

## Usage

Parse a Vue SFC file, modify its descriptor, and write the changes back:

```ts
import fs from 'node:fs'
import { parse, writeBack } from 'vue-sfc-descriptor-write-back'

const parseResult = parse('./src/MyComponent.vue', { cache: false })
const { errors, descriptor, code } = parseResult
if (errors.length > 0) {
  console.error('SFC parsing errors:', errors)
  process.exit(1)
}

if (descriptor.template) {
  descriptor.template.content = `<div>Modified template content</div>`
}

const { hasChanged, code: resolvedCode } = writeBack(code, descriptor)

if (hasChanged) {
  fs.writeFileSync(filename, resolvedCode, 'utf-8')
  console.log(`Successfully updated ${filename}`)
}
```

## Options

- ParseOptions
  - `disableCache` (boolean, default: `true`): Whether to disable caching of `@vue/compiler-sfc parse`.

## Acknowledgements

- [vue-sfc-descriptor-to-string](https://github.com/psalaets/vue-sfc-descriptor-to-string)
- [@vue/compiler-sfc](https://github.com/vuejs/core/tree/main/packages/compiler-sfc)

## License

MIT
