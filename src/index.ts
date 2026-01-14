import type { SFCDescriptor, SFCParseResult } from '@vue/compiler-sfc'
import fs from 'node:fs'
import { parseCache, parse as parseSFC } from '@vue/compiler-sfc'
import MagicString from 'magic-string'

export interface ParseResult extends SFCParseResult {
  code: string
}

export interface WriteBackResult {
  hasChanged: boolean
  code: string
}

export interface ParseOptions {
  disableCache: boolean
}

export const parse = (filename: string, options: undefined | ParseOptions = { disableCache: true }): ParseResult => {
  const code = fs.readFileSync(filename, { encoding: 'utf-8' })
  // parse has a cache generating keys based on the code
  if (options.disableCache) {
    parseCache.clear()
  }
  const result = parseSFC(code, {
    filename,
    sourceMap: false,
  })
  return { code, ...result }
}

export const writeBack = (code: string, descriptor: SFCDescriptor): WriteBackResult => {
  const ms = new MagicString(code)
  const { template, script, scriptSetup, styles, customBlocks } = descriptor
  ;[template, script, scriptSetup, ...styles, ...customBlocks]
    .filter(block => block != null)
    .sort((a, b) => a.loc.start.offset - b.loc.start.offset)
    .reverse()
    .forEach(block => ms.overwrite(block.loc.start.offset, block.loc.end.offset, block.content))
  const hasChanged = ms.hasChanged()
  return { hasChanged, code: hasChanged ? ms.toString() : code }
}
