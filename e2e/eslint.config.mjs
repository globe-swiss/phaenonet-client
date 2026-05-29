import js from '@eslint/js';
import codeceptjs from 'eslint-plugin-codeceptjs';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  {
    ignores: ['output/**/*']
  },
  {
    files: ['**/*.js'],

    languageOptions: {
      ecmaVersion: 12,
      sourceType: 'commonjs',
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.es2021,
        ...codeceptjs.environments.codeceptjs.globals
      }
    },

    plugins: {
      codeceptjs
    },

    rules: {
      ...js.configs.recommended.rules,
      ...codeceptjs.configs.recommended.rules
    }
  },
  {
    files: ['**/*.ts'],

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 12,
      sourceType: 'module'
    }
  },
  prettierRecommended
];
