import type { SFCDescriptor, SFCParseResult } from '@vue/compiler-sfc'
import fs from 'node:fs'
import { parse as parseSFC } from '@vue/compiler-sfc'
import MagicString from 'magic-string'

export interface ParseResult extends SFCParseResult {
  code: string
}

export interface WriteBackResult {
  hasChanged: boolean
  code: string
}

export const parse = (filename: string): ParseResult => {
  const code = fs.readFileSync(filename, { encoding: 'utf-8' })
  const result = parseSFC(code, {
    filename,
    sourceMap: false,
  })
  return { code, ...result }
}

export const writeBack = (code: string, descriptor: SFCDescriptor): { hasChanged: boolean, code: string } => {
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
