import url from '@rollup/plugin-url';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import nodeResolve from '@rollup/plugin-node-resolve';
import shebang from '@walrus/rollup-plugin-shebang';
import autoprefixer from 'autoprefixer';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';
import lessNpmImport from 'less-plugin-npm-import';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { babelCustom } from '../utils';
import { Format, NormalizedConfig } from '../types';

export interface GetPluginsOption {
  format: Format;
  config: NormalizedConfig;
  useTypescript: boolean;
}

export default function getPlugins(
  {
    config,
    format,
    useTypescript
  }: GetPluginsOption,
  writeMeta: boolean
) {
  const { target, alias: aliasConfig, disableTypeCheck } = config;

  const { presets } = babelCustom({
    config,
    format,
    target,
    useTypescript,
  });

  const plugins: Plugin[] = []
    .concat(
      // @ts-ignore
      shebang(),
      peerDepsExternal({
        includeDependencies: true
      }),
      url(),
      alias({
        entries: aliasConfig
      }),
      postcss({
        plugins: [
          autoprefixer(),
        ],
        // only write out CSS for the first bundle (avoids pointless extra files):
        inject: false,
        extract: !!writeMeta,
        use: {
          less: {
            plugins: [new lessNpmImport({ prefix: '~' })],
            javascriptEnabled: true
          }
        } as { [key in 'sass' | 'stylus' | 'less']: any },
      }),
      nodeResolve({
        mainFields: ['module', 'jsnext', 'main'],
        browser: target !== 'node',
        // defaults + .jsx
        extensions: ['.mjs', '.js', '.jsx', '.json', '.node'],
        preferBuiltins: target === 'node',
      }),
      commonjs({
        include: /\/node_modules\//,
      }),
      json(),
      useTypescript &&
        typescript({
          typescript: require('typescript'),
          cacheRoot: `./node_modules/.cache/.rts2_cache_${format}`,
          tsconfig: config.tsconfig,
          check: !disableTypeCheck,
          tsconfigOverride: {
            compilerOptions: {
              module: 'ESNext',
              target: 'esnext',
            },
          }
        }),
      babel({
        babelHelpers: 'bundled',
        babelrc: false,
        presets
      }),
    )
    .filter(Boolean);

  return plugins;
}
