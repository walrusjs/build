import { resolve } from 'path';
import { Plugin } from 'rollup';
import autoprefixer from 'autoprefixer';
import url from '@rollup/plugin-url';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';
import { createBabelConfig } from '@/babel';
import { CreateRollupConfigOptions } from './';

interface GetPluginsOption extends CreateRollupConfigOptions {
  useTypescript: boolean;
}

function getPlugins(opts: GetPluginsOption) {
  const { cwd, useTypescript, format, target, disableTypeCheck } = opts;
  const DEFAULT_ALIAS = [
    {
      find: '@',
      replacement: resolve(cwd, 'src')
    }
  ];

  // 获取babel配置
  const { presets } = createBabelConfig({
    target,
    format,
    useTypescript
  });

  const plugins: Plugin[] = []
    .concat(
      url(),
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
      useTypescript &&
        typescript({
          typescript: require('typescript'),
          cacheRoot: `./node_modules/.cache/.rts2_cache_${format}`,
          tsconfig: opts.tsconfig,
          check: !disableTypeCheck
        }),
      babel({
        babelHelpers: 'bundled',
        presets
      }),
    )
    .filter(Boolean);

  return plugins;
}

export default getPlugins;
