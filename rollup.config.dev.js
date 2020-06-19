// rollup.config.js
import typescript from '@rollup/plugin-typescript';

export default {
	input: 'src/index.ts',
	output: {
		dir: 'dist',
		format: 'iife',
		name: 'Anechoic',
	},
	globals: {
		react: 'React',
		'react-dom': 'ReactDOM',
		'prop-types': 'PropTypes',
	},
	external: [
		'react',
		'react-dom',
		'prop-types',
	],
	plugins: [
		typescript({ lib: ['es5', 'es6', 'dom'], target: 'es5' }),
	],
};
