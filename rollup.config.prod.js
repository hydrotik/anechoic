// rollup.config.js
import typescript from '@rollup/plugin-typescript';

export default {
	input: 'src/index.ts',
	output: {
		dir: 'dist',
		format: 'iife',
		name: 'Anechoic',
	},
	plugins: [
		typescript({ lib: ['es5', 'es6', 'dom'], target: 'es5' }),
	],
};
