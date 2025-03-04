import pluginJest from "eslint-plugin-jest";
import eslint from "@eslint/js"
import tseslint from 'typescript-eslint';
import sonarjs from "eslint-plugin-sonarjs";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from 'globals';


export default [
    eslint.configs.recommended,
    sonarjs.configs.recommended,
    eslintPluginPrettierRecommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.node
            }
        },
        rules: {
            "no-eval": "error",
            "no-implied-eval": "error",
            "no-await-in-loop": "error",
            "no-new-wrappers": "error",
            eqeqeq: "error",
            "@typescript-eslint/no-explicit-any": "off",
        }
    },
    {
        // update this to match your test files
        files: ['**/*.spec.js', '**/*.test.js'],
        plugins: { jest: pluginJest },
        languageOptions: {
          globals: pluginJest.environments.globals.globals,
        },
        rules: {
          'jest/no-disabled-tests': 'warn',
          'jest/no-focused-tests': 'error',
          'jest/no-identical-title': 'error',
          'jest/prefer-to-have-length': 'warn',
          'jest/valid-expect': 'error',
        },
      },
];
