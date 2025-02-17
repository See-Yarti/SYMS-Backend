import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";

export default {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  rules: {
    "no-unused-vars": "warn",
    "no-undef": "error",
    "prefer-const": "warn",
    "no-console": "warn"
  },
  ignorePatterns: ["dist", "node_modules"]
};