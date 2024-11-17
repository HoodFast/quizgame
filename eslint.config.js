import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{mjs,cjs,ts}"]},
  {languageOptions: { globals: {...globals.browser,
      ...globals.node,
        ...globals.jest
      } }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,

  {
    languageOptions: {
      sourceType: 'module',
      parser: tsParser
    },
    plugins: {typescriptEslint},
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions':'off',
      '@typescript-eslint/no-unused-vars':'off',
      '@typescript-eslint/ban-ts-comment':'off',
      '@typescript-eslint/no-require-imports':'off',
      "no-unused-vars": "off",
      "no-undef": "error"
    },
    linterOptions: {
      reportUnusedDisableDirectives: "off"
    }
  }
];
