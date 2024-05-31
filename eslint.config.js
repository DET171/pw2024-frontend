import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js';

export default [
	{ languageOptions: { globals: { ...globals.browser, ...globals.node } } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ['*.ts', '*.tsx'],
		...pluginReactConfig,
		languageOptions: {
			...pluginReactConfig.languageOptions,
			globals: {
				...globals.browser,
			},
		},
	},
	{
		'ignores': [
			'node_modules',
		],
		'rules': {
			'brace-style': ['error', 'stroustrup', { 'allowSingleLine': true }],
			'comma-dangle': ['error', 'always-multiline'],
			'comma-spacing': 'error',
			'comma-style': 'error',
			'curly': ['error', 'multi-line', 'consistent'],
			'dot-location': ['error', 'property'],
			'handle-callback-err': 'off',
			'indent': ['error', 'tab'],
			'max-nested-callbacks': ['error', { 'max': 4 }],
			'max-statements-per-line': ['error', { 'max': 2 }],
			'no-console': 'off',
			'no-empty-function': 'error',
			'no-floating-decimal': 'error',
			'no-lonely-if': 'error',
			'no-multi-spaces': 'error',
			'no-multiple-empty-lines': ['error', { 'max': 2, 'maxEOF': 1, 'maxBOF': 0 }],
			'no-shadow': ['error', { 'allow': ['err', 'resolve', 'reject'] }],
			'no-trailing-spaces': ['error'],
			'object-curly-spacing': ['error', 'always'],
			'prefer-const': 'warn',
			'quotes': ['error', 'single'],
			'semi': ['error', 'always'],
			'space-before-blocks': 'error',
			'no-unused-vars': 'warn',
			'space-before-function-paren': ['error', {
				'anonymous': 'never',
				'named': 'never',
				'asyncArrow': 'always',
			}],
			'space-in-parens': 'error',
			'space-infix-ops': 'error',
			'space-unary-ops': 'error',
			'spaced-comment': 'error',
			'no-inline-comments': 'off',
			'yoda': 'error',
		},
	},
];