// Shared ESLint rules for every package (flat config, ESLint 10).
// TypeScript is parsed by typescript-eslint with this package's TypeScript 6:
// TypeScript 7 (apps/web, apps/admin) has no JavaScript API to parse with.
// Types are checked by `pnpm typecheck`, so rules here don't need type info.
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export const ignores = {
  ignores: ["**/dist/**", "**/.next/**", "**/coverage/**", "**/drizzle/**", "**/next-env.d.ts"],
};

export const base = [
  ignores,
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // `_name` marks a value that is intentionally unused.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", destructuredArrayIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      eqeqeq: ["error", "always"],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];

export default base;
