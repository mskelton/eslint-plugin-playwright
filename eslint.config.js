import mskelton from '@mskelton/eslint-config'

export default [
  ...mskelton.recommended,
  {
    ignores: ['dist/**', '.yarn/**'],
  },
  {
    rules: {
      'sort/imports': 'off',
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      'no-template-curly-in-string': 'off',
    },
  },
]
