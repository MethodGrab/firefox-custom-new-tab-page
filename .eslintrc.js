module.exports = {
	extends: [
		'@methodgrab/standard',
		'@methodgrab/standard/browser',
		'@methodgrab/standard/esnext',
	],

	env: {},

	globals: {
		browser : true,
	},

	rules: {
		'no-param-reassign': 'off',
		'no-shadow': [ 'error', { allow: [ '_' ] }],
		'no-unused-expressions': [ 'warn', {
			allowShortCircuit: true,
			allowTernary: true,
		}],
		'no-warning-comments': [ 'warn', {
			terms: [ 'fixme', 'xxx' ],
			location: 'start',
		}],
		'keyword-spacing': [ 'error', { before: true, after: true } ],
	},
};
