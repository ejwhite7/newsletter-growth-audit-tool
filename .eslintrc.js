module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['standard'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Allow console statements for debugging
    'no-console': 'warn',

    // Allow unused variables that start with underscore
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // Allow function declarations to be used before they are defined
    'no-use-before-define': ['error', { functions: false }],

    // Allow single quotes
    quotes: ['error', 'single'],

    // Allow semicolons
    semi: ['error', 'always'],

    // Allow trailing commas
    'comma-dangle': ['error', 'only-multiline'],

    // Allow space before function parentheses for named functions
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
      },
    ],
  },
  globals: {
    // Global variables for browser environment
    window: 'readonly',
    document: 'readonly',
    navigator: 'readonly',
    fetch: 'readonly',

    // Global variables for your application
    StepManager: 'readonly',
    AuditGenerator: 'readonly',
    DataCollector: 'readonly',
    ComponentLoader: 'readonly',
    ProgressManager: 'readonly',
    FormValidator: 'readonly',

    // Global functions used in HTML onclick handlers
    updateSocialFollowingVisibility: 'readonly',
    removeSocialChannel: 'readonly',

    // External libraries
    z: 'readonly', // Zod library
  },
  overrides: [
    {
      // Different rules for API files
      files: ['api/**/*.js'],
      env: {
        node: true,
        browser: false,
      },
      rules: {
        'no-console': 'off', // Allow console in API files for logging
      },
    },
    {
      // Different rules for client-side JavaScript modules
      files: ['js/**/*.js'],
      env: {
        browser: true,
        node: true, // Allow both since these are modules that might use module.exports
      },
      rules: {
        'no-console': 'warn', // Allow console but warn
      },
    },
    {
      // Rules for main app file
      files: ['app.js', 'api-proxy.js'],
      env: {
        browser: true,
        node: true,
      },
      rules: {
        'no-console': 'warn', // Allow console but warn
      },
    },
  ],
};
