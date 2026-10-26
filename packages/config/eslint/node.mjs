// ESLint for Node code: apps/api and the workspace packages.
import globals from "globals";

import { base } from "./base.mjs";

export default [
  ...base,
  {
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // Tests and NestJS test setup.
    files: ["**/*.spec.ts", "**/*.test.ts", "**/test/**/*.ts"],
    languageOptions: { globals: { ...globals.jest } },
  },
];
