import mskelton from '@mskelton/eslint-config'

export default [
  ...mskelton.recommended,
  {
    ignores: ['dist', 'examples', '.history'],
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      'no-template-curly-in-string': 'off',
    },
  },
]
