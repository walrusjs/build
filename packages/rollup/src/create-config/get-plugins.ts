import url from '@rollup/plugin-url';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import shebang from '@walrus/rollup-plugin-shebang';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { babelCustom } from '../utils';
import { Format, NormalizedConfig } from '../types';

export interface GetPluginsOption {
  format: Format;
  config: NormalizedConfig;
  useTypescript: boolean;
}

export default function getPlugins({
  config,
  format,
  useTypescript
}: GetPluginsOption) {
  const { cwd, target, alias: aliasConfig, } = config;

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
      commonjs({
        include: /\/node_modules\//,
      }),
      json(),
      babel({
        babelHelpers: 'bundled',
        babelrc: false,
        presets
      }),
    )
    .filter(Boolean);

  return plugins;
}
