import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    ignores: ["node_modules/**"],
  },
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        document: "readonly",
        window: "readonly",
        localStorage: "readonly",
        crypto: "readonly",
        FormData: "readonly",
      },
    },
    rules: {
      "no-alert": "error",
    },
  },
];
