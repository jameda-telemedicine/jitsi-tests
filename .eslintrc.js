// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "airbnb-typescript/base",
  ],
  parserOptions: {
    project: "./tsconfig.json",
  },
  rules: {
    "no-await-in-loop": "off",
    "import/prefer-default-export": "off",
    "no-console": "off",
    "no-param-reassign": ["error", { props: false }],
  },
  ignorePatterns: ["dist", ".eslintrc.js"],
};