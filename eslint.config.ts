import eslintJS from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";
import type { Linter } from "eslint";

const eslintConfig: Linter.Config[] = [
	// Base recommended rules
	{
		name: "eslint",
		...eslintJS.configs.recommended,
		files: ["src/**/*.{ts,tsx}"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
				ecmaFeatures: { jsx: true },
			},
			globals: {
				...globals.browser,
				...globals.es2022,
			},
		},
		rules: {
			"no-unused-vars": "warn",
		},
	},

	// Unicorn — best practices
	{
		name: "unicorn",
		plugins: { unicorn: eslintPluginUnicorn },
		files: ["src/**/*.{ts,tsx}"],
		rules: {
			"unicorn/empty-brace-spaces": "error",
			"unicorn/no-array-for-each": "off",
			"unicorn/no-array-reduce": "off",
			"unicorn/no-console-spaces": "error",
			"unicorn/no-null": "off",
			"unicorn/filename-case": "off",
		},
	},

	// Tailwind CSS — canonical & shorthand utilities
	{
		name: "better-tailwindcss",
		plugins: { "better-tailwindcss": eslintPluginBetterTailwindcss },
		files: ["src/**/*.{ts,tsx}"],
		rules: {
			"better-tailwindcss/enforce-canonical-classes": "warn",
			"better-tailwindcss/enforce-shorthand-classes": "warn",
			"better-tailwindcss/no-duplicate-classes": "warn",
			"better-tailwindcss/no-unknown-classes": "off",
		},
		settings: {
			"better-tailwindcss": {
				// Tailwind v4: path ke entry CSS config (berisi @theme)
				entryPoint: "src/styles/main.css",
			},
		},
	},

	// Prettier — disables formatting rules
	{
		name: "prettier",
		...eslintConfigPrettier,
		files: ["src/**/*.{ts,tsx}"],
	},
];

export default eslintConfig;
