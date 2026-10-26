// ESLint for apps/api (NestJS).
import node from "./node.mjs";

export default [
  ...node,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        // NestJS injects dependencies by constructor parameter types, which
        // must stay value imports. These options make typescript-eslint
        // (consistent-type-imports) aware of that.
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
      },
    },
  },
];
