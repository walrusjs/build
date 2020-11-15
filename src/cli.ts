#!/usr/bin/env node

import build from './index';
import prog from './prog';
import { stdout } from './utils';
import logError from '@/utils/log-error';

const run = opts => {
	build(opts)
		.then(({  }) => {
			// if (output != null) stdout(output);
			// if (!opts.watch) process.exit(0);
		})
		.catch(err => {
			process.exitCode = (typeof err.code === 'number' && err.code) || 1;
			logError(err);
			process.exit();
		});
};

prog(run)(process.argv);
