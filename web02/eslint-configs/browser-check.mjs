export default {
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    globals: {
      // Browser globals
      window: 'readonly',
      document: 'readonly',
      navigator: 'readonly',
      console: 'readonly',
      fetch: 'readonly',
      localStorage: 'readonly',
      sessionStorage: 'readonly',
      
      // Common libraries and patterns
      $: 'readonly',
      jQuery: 'readonly',
      
      // Add your custom globals here
      Main: 'writable',
      
      // Module pattern support
      module: 'writable',
      exports: 'writable',
      require: 'readonly'
    }
  },
  rules: {
    // Syntax errors
    'no-const-assign': 'error',
    'no-this-before-super': 'error',
    'no-unreachable': 'error',
    'constructor-super': 'error',
    'valid-typeof': 'error',
    'no-dupe-args': 'error',
    'no-dupe-class-members': 'error',
    'no-dupe-keys': 'error',
    'no-func-assign': 'error',
    'no-import-assign': 'error',
    'no-obj-calls': 'error',
    'no-unsafe-negation': 'error',
    
    // Warnings
    'no-unused-vars': 'warn',
    
    // Disable some rules that might cause false positives
    'no-undef': 'error'  // Keep this as error, but we've added more globals
  }
};
