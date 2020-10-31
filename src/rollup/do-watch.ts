import { relative, dirname } from 'path';
import { watch } from 'rollup';
import { blue } from 'kleur';
import { stdout } from '@/utils';
import logError from '@/utils/log-error';

const WATCH_OPTS = {
	exclude: 'node_modules/**',
};

export default function doWatch(options, cwd, steps) {
	const { onStart, onBuild, onError } = options;

	return new Promise((resolve, reject) => {
		const targetDir = relative(cwd, dirname(options.output));
		stdout(blue(`Watching source, compiling to ${targetDir}:`));

		const watchers = steps.reduce((acc, options) => {
			acc[options.inputOptions.input] = watch(
				Object.assign(
					{
						output: options.outputOptions,
						watch: WATCH_OPTS,
					},
					options.inputOptions,
				),
			).on('event', e => {
				if (e.code === 'START') {
					if (typeof onStart === 'function') {
						onStart(e);
					}
				}
				if (e.code === 'ERROR') {
					logError(e.error);
					if (typeof onError === 'function') {
						onError(e);
					}
				}
				if (e.code === 'END') {
					options._sizeInfo.then(text => {
						stdout(`Wrote ${text.trim()}`);
					});
					if (typeof onBuild === 'function') {
						onBuild(e);
					}
				}
			});

			return acc;
		}, {});

		resolve({ watchers });
	});
}