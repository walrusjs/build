import { PluginItem } from '@babel/core';
import { NormalizedConfig, Format, Target } from '../types';
import { Options, EnvOptions } from '@walrus/babel-preset-walrus';

interface BabelCustomOptions {
  config: NormalizedConfig;
  format: Format;
  target: Target;
  useTypescript: boolean;
}

const babelCustom = ({
  config,
  format,
  target,
  useTypescript
}: BabelCustomOptions) => {
  let isBrowser = target === 'browser';
  const targets: EnvOptions['targets']  = isBrowser
    ? { browsers: ['last 2 versions', 'IE 10'] }
    : { node: 8 };

  const babelPresetWalrusOpts: Options = {
    env: {
      modules: format === 'esm' ? false : 'auto',
      targets
    },
    asyncToPromises: true,
    typescript: !!useTypescript,
    defines: config.replaceMode === 'babel'
      ? config.replace
      : undefined
  }

  if (isBrowser) {
    babelPresetWalrusOpts.react = {}
  }

  const presets: PluginItem[] = [
    [require.resolve('@walrus/babel-preset-walrus'), babelPresetWalrusOpts]
  ];

  return {
    presets
  }
}

export default babelCustom;
