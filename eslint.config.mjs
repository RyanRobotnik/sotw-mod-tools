import js from '@eslint/js';
import { defineConfig } from "eslint/config";
import tseslint from 'typescript-eslint';
import googleappsscript from 'eslint-plugin-googleappsscript';
import globals from 'globals';

export default defineConfig(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    name: "Google Apps Script",
    files: ['src/**/*.ts'],
    plugins: {
      googleappsscript,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...googleappsscript.environments.googleappsscript.globals,
      },
    },
    rules: {
      // GAS specific: since it's a global scope, we often need to turn off redeclare
      "no-redeclare": "off",
      "@typescript-eslint/no-redeclare": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    name: "Global ignores",
    ignores: ['dist/**', 'node_modules/**'],
  },
);