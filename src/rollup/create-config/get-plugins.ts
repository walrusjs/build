import { resolve } from 'path';
import { Plugin } from 'rollup';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import url from '@rollup/plugin-url';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';
import lessNpmImport from 'less-plugin-npm-import';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import shebang from '@walrus/rollup-plugin-shebang';
import { createBabelConfig } from '@/babel';
import { shouldCssModules, cssModulesConfig } from '@/utils/css-modules';
import { CreateRollupConfigOptions } from './';

interface GetPluginsOption extends CreateRollupConfigOptions {
  useTypescript: boolean;
}

function getPlugins(opts: GetPluginsOption, writeMeta?: boolean) {
  const {
    cwd,
    useTypescript,
    format,
    target,
    disableTypeCheck
  } = opts;

  const moduleAlias = opts.alias ?? [];

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
      shebang(),
      peerDepsExternal({
        includeDependencies: true
      }),
      url(),
      postcss({
        plugins: [
          autoprefixer(),
          opts.compress === true &&
            cssnano({
              preset: 'default',
            }),
        ].filter(Boolean),
        autoModules: shouldCssModules(opts),
        modules: cssModulesConfig(opts),
        // only write out CSS for the first bundle (avoids pointless extra files):
        inject: false,
        extract: true,
        use: {
          less: {
            plugins: [new lessNpmImport({ prefix: '~' })],
            javascriptEnabled: true
          }
        } as { [key in 'sass' | 'stylus' | 'less']: any },
      }),
      alias({
        entries: [
          ...DEFAULT_ALIAS,
          ...moduleAlias
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

export default getPlugins;
