// @ts-check

import eslint from '@eslint/js'
import prettier from 'eslint-config-prettier'
import sort from 'eslint-plugin-sort'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  sort.configs['flat/recommended'],
  prettier,
  {
    ignores: ['dist/**', '.yarn/**'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-useless-constructor': 'error',
      'curly': 'error',
      'no-template-curly-in-string': 'error',
      'no-unused-vars': 'off',
      'no-useless-constructor': 'off',
      'no-useless-rename': 'warn',
      'no-var': 'error',
      'object-shorthand': 'warn',
      'prefer-template': 'error',
      'sort/exports': 'off',
      'sort/imports': 'off',
      'sort/string-enums': 'warn',
      'sort/string-unions': 'warn',
      'sort/type-properties': 'warn',
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      'no-template-curly-in-string': 'off',
    },
  },
)
