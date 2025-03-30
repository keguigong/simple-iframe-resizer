import antfu from "@antfu/eslint-config";

export default antfu({
  stylistic: {
    indent: 2,
    semi: true,
    quotes: "double",
    overrides: {
      "node/prefer-global/process": "off",
      "perfectionist/sort-imports": [
        "error",
        {
          newlinesBetween: "never",
        },
      ],
    },
  },
});
