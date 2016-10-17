module.exports = {
	extends: [
		'@methodgrab/standard',
		'@methodgrab/standard/browser',
		'@methodgrab/standard/esnext',
	],

	env: {},

	globals:  {},

	rules: {
		'no-param-reassign'     : 'off',
		'no-unused-expressions' : [ 'warn', { allowShortCircuit: true, allowTernary: true } ],
	},
};
