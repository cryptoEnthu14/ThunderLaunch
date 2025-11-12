import eslintConfig from 'eslint-config-next';

const config = [
  {
    ignores: ['.next/**', 'node_modules/**'],
  },
  ...eslintConfig,
];

export default config;
