import antfu from "@antfu/eslint-config"

export default antfu({
  /** @see https://github.com/antfu/eslint-config?tab=readme-ov-file#optional-configs */
  formatters: {
    css: true,
    html: true,
    markdown: "prettier",
  },
  stylistic: {
    indent: 2,
    quotes: "double",
    overrides: {
      "node/prefer-global/process": ["off", "always"],
      "perfectionist/sort-imports": [
        "error",
        {
          newlinesBetween: "never",
        },
      ],
    },
  },
})
