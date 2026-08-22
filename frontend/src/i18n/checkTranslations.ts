import { bn } from './locales/bn'
import { en } from './locales/en'
import { hi } from './locales/hi'
import { mr } from './locales/mr'
import { ta } from './locales/ta'
import { te } from './locales/te'

const locales = {
  English: en,
  Hindi: hi,
  Tamil: ta,
  Telugu: te,
  Bengali: bn,
  Marathi: mr,
}

function getAllKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = []
  for (const k of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      keys = keys.concat(getAllKeys(obj[k], fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

const enKeys = getAllKeys(en)
console.log(`[PRAVAH i18n Completeness Audit] Total Master Keys in English: ${enKeys.length}`)

let totalErrors = 0

for (const [name, dict] of Object.entries(locales)) {
  if (name === 'English') continue
  const dictKeys = new Set(getAllKeys(dict))
  const missing = enKeys.filter((k) => !dictKeys.has(k))

  if (missing.length === 0) {
    console.log(`✓ ${name}: 0 missing keys (100% Complete - ${enKeys.length}/${enKeys.length})`)
  } else {
    console.error(`✗ ${name}: ${missing.length} MISSING KEYS:`, missing)
    totalErrors += missing.length
  }
}

if (totalErrors === 0) {
  console.log('\n🌟 SUCCESS: All 6 languages have 100% key parity with 0 missing keys!')
} else {
  console.error(`\nFAILED: Found ${totalErrors} missing keys across locales.`)
}
