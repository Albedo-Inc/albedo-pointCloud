export default [
	{
		input: 'src/Potree.js',
		treeshake: false,
		output: {
			file: 'build/potree/potree.js',
			format: 'umd',
			name: 'Potree',
			sourcemap: false,
		}
	}
]