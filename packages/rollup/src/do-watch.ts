import { watch, RollupWatcherEvent, WatcherOptions, RollupWatchOptions } from 'rollup';
import { isString } from 'lodash';
import { blue } from 'kleur';
import { relative, dirname } from 'path';
import { stdout } from './utils';
import { Task } from './types';

interface Options {
  output: string;
  onStart?: (e: RollupWatcherEvent) => void;
  onEnd?: (e: RollupWatcherEvent) => void;
  onBuildStart?: (e: RollupWatcherEvent) => void;
  onBuildEnd?: (e: RollupWatcherEvent) => void;
  onError?: (e: RollupWatcherEvent, message: string) => void;
}

const WATCH_OPTS: WatcherOptions = {
	exclude: 'node_modules/**',
};

function doWatch(options: Options, cwd: string, tasks: Task[]) {
  const { onStart, onEnd, onError, onBuildStart, onBuildEnd } = options;

	return new Promise((resolve) => {
    // const targetDir = relative(cwd, dirname(options.output));
    // stdout(blue(`Watching source, compiling to ${targetDir}:`));

		const list = tasks.reduce((prev: RollupWatchOptions[], options) => {
      const watchOptions: RollupWatchOptions = {
        output: options.outputOptions,
        watch: WATCH_OPTS,
        ...options.inputOptions
      };
      prev.push(watchOptions);

			return prev;
    }, []);

    const watcher = watch(list).on('event', e => {
      if (e.code === 'START') {
        if (typeof onStart === 'function') {
          onStart(e);
        }
      }

      if (e.code === 'BUNDLE_START') {
        if (typeof onBuildStart === 'function') {
          onBuildStart(e);
        }
      }

      if (e.code === 'BUNDLE_END') {
        if (typeof onBuildEnd === 'function') {
          onBuildEnd(e);
        }
      }

      if (e.code === 'END') {
        // options._sizeInfo.then((text: string) => {
        // 	stdout(`Wrote ${text.trim()}`);
        // });
        if (typeof onEnd === 'function') {
          onEnd(e);
        }
      }

      if (e.code === 'ERROR') {
        if (typeof onError === 'function') {
          onError(e, e.error.message);
        }
      }
    });

		resolve({ watcher });
	});
}

export default doWatch;
