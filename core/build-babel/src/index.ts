import path from 'path';
import gulp from 'gulp';
import fs from 'fs';
import { Options, EnvOptions } from '@walrus/babel-preset-walrus';
import babel from './babel';
import {
  deleteDir,
} from './utils';
import { BabelOptions } from './types';
import { defaultOpts } from './config';
import getGulpConfig from './gulp';

async function build(opts: BabelOptions = {}) {

  const babelOpts = {
    ...defaultOpts,
    ...opts
  } as Required<BabelOptions>;
  babelOpts.cwd = path.resolve(babelOpts.cwd ?? '.');
  babelOpts.outDir = path.join(babelOpts.cwd, babelOpts.outDir);

  /** 处理目录 */
  const buildDirs = Array
    .from(
      new Set(
        Array.isArray(babelOpts.buildDir)
          ? babelOpts.buildDir
          : [babelOpts.buildDir]
      )
    )
    .map(item => path.join(babelOpts.cwd, item));


  let isBrowser = opts.target === 'browser';
  const targets: EnvOptions['targets']  = isBrowser
    ? { browsers: ['last 2 versions', 'IE 10'] }
    : { node: 8 };

  const babelPresetWalrusOpts: Options = {
    env: {
      modules: false,
      targets
    },
    asyncToPromises: true,
    typescript: true
  }

  /** 删除输出目录 */
  deleteDir(babelOpts.outDir);

  /** 创建输出目录 */
  fs.mkdirSync( babelOpts.outDir, { recursive: true });

  /** 编译JS */
  await babel({ ...babelOpts, buildDirs }, {
    babelrc: false,
    presets: [
      [require.resolve('@walrus/babel-preset-walrus'), babelPresetWalrusOpts]
    ]
  });

  /** 编译CSS */
  for (const buildDir of buildDirs) {
    // @ts-ignore
    getGulpConfig({ ...babelOpts, buildDir  })(gulp);
  }
}

build();


export default build;
