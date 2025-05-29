import js from '@eslint/js';
import jestPlugin from 'eslint-plugin-jest';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...jestPlugin.environments.globals.globals,
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        Event: 'readonly', 
        HTMLElement: 'readonly',
        CustomEvent: 'readonly',
        MouseEvent: 'readonly',
        KeyboardEvent: 'readonly'
      },
    },
    plugins: {
      jest: jestPlugin,
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': 'warn',
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/valid-expect': 'error',
    },
  },
];