import url from '@rollup/plugin-url';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { PostcssModulesOptions } from '@walrus/build-utils';
import { terser, Options as TerserOptions  } from "rollup-plugin-terser";
import inject, { RollupInjectOptions } from '@rollup/plugin-inject';
import shebang from '@walrus/rollup-plugin-shebang';
import autoprefixer from 'autoprefixer';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';
import lessNpmImport from 'less-plugin-npm-import';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import svgr from '@svgr/rollup';
import tempDir from 'temp-dir';
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
  const {
    target,
    cssModules: modules,
    alias: aliasOpts,
    replace: replaceOpts,
    disableTypeCheck
  } = config;

  const { presets } = babelCustom({
    config,
    format,
    target,
    useTypescript,
  });

  const terserOpts: TerserOptions = {
    compress: {
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true
    },
  };

  const plugins: Plugin[] = []
    .concat(
      // @ts-ignore
      shebang(),
      config.replaceMode === 'rollup' &&
        replace(replaceOpts ?? {}),
      peerDepsExternal({
        includeDependencies: true
      }),
      url(),
      svgr(),
      alias({
        entries: aliasOpts
      }),
      postcss({
        plugins: [
          autoprefixer(),
        ],
        // only write out CSS for the first bundle (avoids pointless extra files):
        inject: false,
        extract: !!writeMeta,
        modules,
        // modules => all .less will convert into css modules
        ...(modules ? { autoModules: false } : {}),
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
      useTypescript &&
        typescript({
          cwd: config.cwd,
          clean: true,
          cacheRoot: `${tempDir}/.rollup_plugin_typescript2_cache`,
          typescript: require('typescript'),
          tsconfig: config.tsconfig,
          check: !disableTypeCheck,
          tsconfigDefaults: {
            compilerOptions: {
              sourceMap: config.sourcemap,
              declaration: true
            }
          },
          tsconfigOverride: {
            compilerOptions : {
              module: 'esnext'
            }
          }
        }),
      babel({
        babelHelpers: 'bundled',
        exclude: /\/node_modules\//,
        babelrc: false,
        presets,
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.es6', '.es', '.mjs']
      }),
      json(),
      config.compress !== false && terser(terserOpts)
    )
    .filter(Boolean);

  return plugins;
}
