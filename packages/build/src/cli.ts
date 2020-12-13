#!/usr/bin/env node
import build, { Opts } from './index';
import prog from './prog';

const run = (opts: Opts) => {
  console.log(opts);
  build(opts)
    .then(() => {

    })
    .catch(err => {
      process.exitCode = (typeof err.code === 'number' && err.code) || 1;
      process.exit();
    });
};

prog(run)(process.argv);
