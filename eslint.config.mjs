import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  {
    ignores: ['dist/**/*', 'src/assets/**/*']
  },
  ...compat
    .extends(
      'eslint:recommended',
      'plugin:@angular-eslint/recommended',
      'plugin:@angular-eslint/template/process-inline-templates',
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',
      'plugin:prettier/recommended'
    )
    .map(config => ({
      ...config,
      files: ['src/**/*.ts']
    })),
  {
    files: ['src/**/*.ts'],

    languageOptions: {
      ecmaVersion: 5,
      sourceType: 'module',

      parserOptions: {
        createDefaultProgram: true,
        project: ['tsconfig.json']
      }
    },

    rules: {
      '@angular-eslint/component-selector': [
        'error',
        {
          prefix: 'app',
          style: 'kebab-case',
          type: 'element'
        }
      ],

      '@angular-eslint/directive-selector': [
        'error',
        {
          prefix: 'app',
          style: 'camelCase',
          type: 'attribute'
        }
      ],

      '@typescript-eslint/consistent-type-definitions': 'error',
      '@typescript-eslint/dot-notation': 'off',

      '@typescript-eslint/explicit-member-accessibility': [
        'off',
        {
          accessibility: 'explicit'
        }
      ],

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_'
        }
      ],

      'brace-style': ['error', '1tbs'],
      'id-blacklist': 'off',
      'id-match': 'off',
      'no-underscore-dangle': 'off',
      'no-unused-vars': 'off'
    }
  },
  ...compat.extends('plugin:@angular-eslint/template/recommended', 'plugin:prettier/recommended').map(config => ({
    ...config,
    files: ['src/**/*.html']
  }))
];
