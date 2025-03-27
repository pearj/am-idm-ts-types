import jestPlugin from "eslint-plugin-jest";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import sonarjs from "eslint-plugin-sonarjs";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";

// Based off: https://typescript-eslint.io/packages/typescript-eslint/#usage-with-other-plugins

export default tseslint.config(
  {
    // config with just ignores is the replacement for `.eslintignore`
    // ignores: ['**/build/**', '**/dist/**', 'src/some/file/to/ignore.ts'],
    ignores: [],
  },
  eslint.configs.recommended,
  sonarjs.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  // eslintConfigPrettier,
  eslintPluginPrettierRecommended,
  {
    plugins: { "@typescript-eslint": tseslint.plugin, jest: jestPlugin },
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        // @ts-expect-error because the module is commonjs import.meta is not available
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-await-in-loop": "error",
      "no-new-wrappers": "error",
      eqeqeq: "error",
      "@typescript-eslint/no-explicit-any": "off",
      "sonarjs/different-types-comparison": "off",
    },
  },
  {
    // disable type-aware linting on JS files
    files: ["**/*.js"],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    // update this to match your test files
    files: ["**/*.spec.js", "**/*.test.js"],
    extends: [jestPlugin.configs["flat/recommended"]],
    languageOptions: {
      globals: jestPlugin.environments.globals.globals,
    },
    rules: {
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/prefer-to-have-length": "warn",
      "jest/valid-expect": "error",
    },
  },
);

// export default tseslint.config(
//   eslint.configs.recommended,
//   sonarjs.configs.recommended,
//   tseslint.configs.recommendedTypeChecked,
//   eslintPluginPrettierRecommended,
//   {
//     languageOptions: {
//       globals: {
//         ...globals.node
//       },
//       parserOptions: {
//         projectService: true,
//         // @ts-ignore
//         tsconfigRootDir: import.meta.dirname
//       }
//     },
//     rules: {
//       "no-eval": "error",
//       "no-implied-eval": "error",
//       "no-await-in-loop": "error",
//       "no-new-wrappers": "error",
//       eqeqeq: "error",
//       "@typescript-eslint/no-explicit-any": "off"
//     }
//   },
//   {
//     // update this to match your test files
//     files: ["**/*.spec.js", "**/*.test.js"],
//     plugins: { jest: pluginJest },
//     languageOptions: {
//       globals: pluginJest.environments.globals.globals
//     },
//     rules: {
//       "jest/no-disabled-tests": "warn",
//       "jest/no-focused-tests": "error",
//       "jest/no-identical-title": "error",
//       "jest/prefer-to-have-length": "warn",
//       "jest/valid-expect": "error"
//     }
//   }
// );
