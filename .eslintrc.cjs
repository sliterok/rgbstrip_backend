module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  env: { browser: true, node: true, es2021: true },
  plugins: ['@typescript-eslint', 'react', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
  ],
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: { project: [__dirname + '/tsconfig.json'] },
    },
  },
};
