import { resolve } from 'path';
import { Plugin } from 'rollup';
import autoprefixer from 'autoprefixer';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';
import { Format } from '../../types';

interface GetPluginsOption {
  cwd: string;
  target?: 'node';
  useTypescript: boolean;
  format?: Format;
}

function getPlugins(opts: GetPluginsOption) {
  const { cwd, useTypescript, format } = opts;
  const DEFAULT_ALIAS = [
    {
      find: '@',
      replacement: resolve(cwd, 'src')
    }
  ];

  const plugins: Plugin[] = []
    .concat(
      postcss({
        plugins: [
          autoprefixer(),
        ]
      }),
      alias({
        entries: [
          ...DEFAULT_ALIAS,
        ]
      }),
      nodeResolve({
        mainFields: ['module', 'jsnext', 'main'],
        browser: opts.target !== 'node',
        // defaults + .jsx
        extensions: ['.mjs', '.js', '.jsx', '.json', '.node'],
        preferBuiltins: opts.target === 'node',
      }),
      commonjs({
        include: /\/node_modules\//,
      }),
      json(),
      babel({
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env']
      }),
      useTypescript &&
        typescript({
          typescript: require('typescript'),
          cacheRoot: `./node_modules/.cache/.rts2_cache_${format}`,
        })
    )
    .filter(Boolean);

  return plugins;
}

export default getPlugins;
