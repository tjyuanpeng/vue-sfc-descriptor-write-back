import fs from 'node:fs'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { parse, writeBack } from '../src/index'

const FIXTURES_DIR = path.resolve(__dirname, 'fixtures')
const BASIC_SFC_PATH = path.resolve(FIXTURES_DIR, 'basic.vue')
const INVALID_SFC_PATH = path.resolve(FIXTURES_DIR, 'invalid.vue')
const EMPTY_SFC_PATH = path.resolve(FIXTURES_DIR, 'empty.vue')
const PRESERVE_SFC_PATH = path.resolve(FIXTURES_DIR, 'preserve.vue')

let basicSfcOriginalContent: string
beforeEach(() => {
  basicSfcOriginalContent = fs.readFileSync(BASIC_SFC_PATH, 'utf-8')
})

afterEach(() => {
  fs.writeFileSync(BASIC_SFC_PATH, basicSfcOriginalContent, 'utf-8')
})

describe('parse', () => {
  it('should parse valid SFC and return code + descriptor + empty errors', () => {
    const result = parse(BASIC_SFC_PATH)
    expect(result).toHaveProperty('code', basicSfcOriginalContent)
    expect(result).toHaveProperty('descriptor')
    expect(result.errors).toHaveLength(0)

    const { descriptor } = result
    expect(descriptor.template).toBeDefined()
    expect(descriptor.scriptSetup).toBeDefined()
    expect(descriptor.styles).toHaveLength(1)
    expect(descriptor.customBlocks).toHaveLength(1)
  })

  it('should return errors when parsing invalid SFC', () => {
    const result = parse(INVALID_SFC_PATH)
    expect(result.errors).not.toHaveLength(0)
    expect(result.errors[0].message).toContain('Error parsing JavaScript expression')
  })

  it('should parse empty SFC without throwing error', () => {
    const result = parse(EMPTY_SFC_PATH)
    expect(result.descriptor.template).toBeNull()
    expect(result.errors[0].message).toContain('At least one <template> or <script> is required in a single file component.')
  })
})

describe('writeBack', () => {
  it('should update template content and return hasChanged = true', () => {
    const { code: originalCode, descriptor } = parse(BASIC_SFC_PATH)
    descriptor.template!.content = '<div>Modified Template</div>'
    const { hasChanged, code: updatedCode } = writeBack(originalCode, descriptor)
    expect(hasChanged).toBe(true)
    expect(updatedCode).toContain('<div>Modified Template</div>')
    expect(updatedCode).not.toContain('<div>Original Template</div>')
    expect(updatedCode).toContain('const msg = \'original\'')
    expect(updatedCode).toContain('.foo { color: red; }')
  })

  it('should update multiple blocks (script + style + custom) correctly', () => {
    const { code: originalCode, descriptor } = parse(BASIC_SFC_PATH)
    descriptor.scriptSetup!.content = 'const msg = "modified"'
    descriptor.styles[0].content = '.foo { color: blue; }'
    descriptor.customBlocks[0].content = 'modified custom'
    const { hasChanged, code: updatedCode } = writeBack(originalCode, descriptor)
    expect(hasChanged).toBe(true)
    expect(updatedCode).toContain('const msg = "modified"')
    expect(updatedCode).toContain('.foo { color: blue; }')
    expect(updatedCode).toContain('modified custom')
  })

  it('should return the result of previous parse calling when disabledCache = false', () => {
    const { code: originalCode, descriptor } = parse(BASIC_SFC_PATH, { disableCache: false })
    const { hasChanged, code: updatedCode } = writeBack(originalCode, descriptor)
    expect(hasChanged).toBe(true)
    expect(updatedCode).toContain('const msg = "modified"')
  })

  it('should return hasChanged = false when no content modified', () => {
    const { code: originalCode, descriptor } = parse(BASIC_SFC_PATH)
    const { hasChanged, code: updatedCode } = writeBack(originalCode, descriptor)
    expect(hasChanged).toBe(false)
    expect(updatedCode).toBe(originalCode)
  })

  it('should preserve non-block content (comments/whitespace)', () => {
    const { code: originalCode, descriptor } = parse(PRESERVE_SFC_PATH)
    descriptor.scriptSetup!.content = 'const msg = "modified"'
    const { hasChanged, code: updatedCode } = writeBack(originalCode, descriptor)
    expect(hasChanged).toBe(true)
    expect(updatedCode).toContain('<!-- This is a comment 1 outside blocks -->')
    expect(updatedCode).toContain('<!-- This is a comment 2 outside blocks -->')
    expect(updatedCode).toContain('<!-- This is a comment 3 outside blocks -->')
    expect(updatedCode).toContain('<!-- This is a comment 4 outside blocks -->')
    expect(updatedCode).toContain('<!-- This is a comment 5 outside blocks -->')
    expect(updatedCode).toContain('const msg = "modified"')
  })
})
