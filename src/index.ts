import { flatConfig, legacyConfig, plugin } from './plugin.ts'

// @ts-expect-error We author this plugin in ESM, but export as CJS for
// compatibility with ESLint<9. Long term, this will be changed to `export default`.
export = {
  ...plugin,
  configs: {
    'flat/recommended': flatConfig,
    'playwright-test': legacyConfig,
    'recommended': legacyConfig,
  },
}
