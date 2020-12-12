import { watch, RollupWatcherEvent, WatcherOptions } from 'rollup';
import { isString } from 'lodash';
import { blue } from 'kleur';
import { relative, dirname } from 'path';
import { stdout } from './';
import { Task } from '../types';

interface Options {
  output: string;
  onStart?: (e: RollupWatcherEvent) => void;
  onBuild?: (e: RollupWatcherEvent) => void;
  onError?: (e: RollupWatcherEvent) => void;
}

const WATCH_OPTS: WatcherOptions = {
	exclude: 'node_modules/**',
};

function doWatch(options: Options, cwd: string, tasks: Task[]) {
	const { onStart, onBuild, onError } = options;

	return new Promise((resolve) => {
		const targetDir = relative(cwd, dirname(options.output));
    stdout(blue(`Watching source, compiling to ${targetDir}:`));

		const watchers = tasks.reduce((prev, options) => {
      const input = options.inputOptions.input as string;
      if (isString(input)) {
        // @ts-ignore
        prev[input] = watch(
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
              onStart?.(e);
            }
          }
          if (e.code === 'ERROR') {
            if (typeof onError === 'function') {
              onError?.(e);
            }
          }
          if (e.code === 'END') {
            // options._sizeInfo.then((text: string) => {
            // 	stdout(`Wrote ${text.trim()}`);
            // });
            if (typeof onBuild === 'function') {
              onBuild?.(e);
            }
          }
        });
      }

			return prev;
    }, {});

    console.log(watchers);

		resolve({ watchers });
	});
}

export default doWatch;
