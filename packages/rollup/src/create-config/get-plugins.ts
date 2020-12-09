import url from '@rollup/plugin-url';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import alias, { Alias } from '@rollup/plugin-alias';
import shebang from '@walrus/rollup-plugin-shebang';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { Format } from '../types';

export interface GetPluginsOption {
  cwd: string;
  useTypescript: boolean;
  format: Format;
  alias: Alias[];
}

export default function getPlugins({
  cwd,
  alias: aliasConfig,
  useTypescript
}: GetPluginsOption) {

  const plugins: Plugin[] = []
    .concat(
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
    )
    .filter(Boolean);

  return plugins;
}
