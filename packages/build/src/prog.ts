import sade from 'sade';
// @ts-ignore
import { DEFAULT_FORMATS } from '@walrus/rollup/lib/config';

const pkg = require('../package.json');
const toArray = (val: any) => (Array.isArray(val) ? val : val == null ? [] : [val]);

export default (handler: (opts: any) => void) => {
	const cmd = (type: string) => (str: string, opts: any) => {
		opts.watch = opts.watch || type === 'watch';

    opts.entries = toArray(str || opts.entry).concat(opts._);

    opts.format = toArray(opts.format.split(','));

		if (opts.compress != null) {
			// Convert `--compress true/false/1/0` to booleans:
			if (typeof opts.compress !== 'boolean') {
				opts.compress = opts.compress !== 'false' && opts.compress !== '0';
			}
		} else {
			// the default compress value is `true` for browser, `false` for Node:
			opts.compress = opts.target !== 'node';
		}

		handler(opts);
	};

	let prog = sade('wb');

	prog
		.version(pkg.version)
		.option('--entry, -i', 'Entry module(s)')
		.option('--output, -o', 'Directory to place build files into')
		.option(
			'--format, -f',
			`Only build specified formats (any of ${DEFAULT_FORMATS} or iife)`,
			DEFAULT_FORMATS,
		)
		.option('--watch, -w', 'Rebuilds on any change', false)
		.option(
			'--pkg-main',
			'Outputs files analog to package.json main entries',
			true,
		)
		.option('--target', 'Specify your target environment (node or browser)', 'browser')
		.option('--external', `Specify external dependencies, or 'none'`)
		.option('--globals', `Specify globals dependencies, or 'none'`)
		.example('wb --globals react=React,jquery=$')
		.option('--define', 'Replace constants with hard-coded values')
		.example('wb --define API_KEY=1234')
		.option('--alias', `Map imports to different modules`)
		.example('wb --alias react=preact')
		.option('--compress', 'Compress output using Terser', undefined)
		.option('--strict', 'Enforce undefined global context and add "use strict"', true)
		.option('--name', 'Specify name exposed in UMD builds')
		.option('--cwd', 'Use an alternative working directory', '.')
		.option('--sourcemap', 'Generate source map', true)
		.option(
			'--css-modules',
			'Turns on css-modules for all .css imports. Passing a string will override the scopeName. eg --css-modules="_[hash]"',
			undefined,
		)
		.example("wb --no-sourcemap # don't generate sourcemaps")
		.option('--raw', 'Show raw byte size', false)
		.option(
			'--jsx',
			'A custom JSX pragma like React.createElement (default: h)',
		)
		.option('--tsconfig', 'Specify the path to a custom tsconfig.json')
		.example('wb build --tsconfig tsconfig.build.json');

	prog
		.command('build [...entries]', '', { default: true })
		.describe('Build once and exit')
    .action(cmd('build'));

	// Parse argv; add extra aliases
	return (argv: any) =>
		prog.parse(argv, {
			alias: {
				o: ['output', 'd'],
        i: ['entry', 'entries', 'e'],
				w: ['watch'],
			},
		});
};