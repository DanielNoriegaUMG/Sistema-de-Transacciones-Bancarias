module.exports = [
  {
    ignores: ["node_modules/**", "client/**", "coverage/**"],
  },
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        afterAll: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        beforeEach: "readonly",
        console: "readonly",
        describe: "readonly",
        expect: "readonly",
        jest: "readonly",
        module: "readonly",
        process: "readonly",
        require: "readonly",
        test: "readonly",
      },
    },
    rules: {
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
        },
      ],
      "no-console": "off",
      semi: ["error", "always"],
      quotes: ["warn", "double"],
      indent: ["warn", 2],
      "comma-dangle": ["warn", "always-multiline"],
    },
  },
];
