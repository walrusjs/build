import { PluginItem } from '@babel/core';
import { Target, Format } from '@/types';

interface CreateRollupConfigOpts {
  /**
   * 是否使用TS
   */
  useTypescript?: boolean;
  target?: Target;
  format?: Format;
  nodeVersion?: string | number;
}

const createBabelConfig = (opts: CreateRollupConfigOpts = {}) => {
  const { useTypescript, target, nodeVersion, format } = opts;
  let isBrowser = target === 'browser';
  const targets = isBrowser ? { browsers: ['last 2 versions', 'IE 10'] } : { node: nodeVersion || 8 };

  const presets: PluginItem[] = [
    useTypescript && [require.resolve('@babel/preset-typescript')],
    [require.resolve('@babel/preset-env'), {
      targets,
      modules: format === 'esm' ? false : 'auto'
    }],
    [require.resolve('@babel/preset-react')]
  ].filter(Boolean);;

  return {
    presets
  }
}

export default createBabelConfig;
