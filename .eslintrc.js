module.exports = {
	extends: [
		'@methodgrab/standard',
		'@methodgrab/standard/browser',
		'@methodgrab/standard/esnext',
	],

	env: {},

	globals: {
		'browser' : true,
	},

	rules: {
		'no-param-reassign'     : 'off',
		'no-unused-expressions' : [ 'warn', { allowShortCircuit: true, allowTernary: true } ],
		'keyword-spacing'       : [ 'error', { 'before': true, 'after': true } ]
	},
};
