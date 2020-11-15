import { InputOptions } from 'rollup';
import { extname } from 'path';
import getPlugins from './get-plugins';
import { Format, Config } from '@/types';

export interface CreateRollupConfigOptions extends Config {
  format?: Format;
}

interface CreateRollupConfigResult {
  inputOptions: InputOptions,
}

const createRollupConfig = (opts: CreateRollupConfigOptions): CreateRollupConfigResult => {
  const entry = opts.entry as string;

  const useTypescript = extname(entry) === '.ts' || extname(entry) === '.tsx';

  const plugins = getPlugins({
    ...opts,
    useTypescript
  });

  return {
    inputOptions: {
      input: entry,
      plugins,
      treeshake: {
				propertyReadSideEffects: false,
			},
      // 暂时忽略所有警告
      onwarn(warning) {
        if (warning.code === 'THIS_IS_UNDEFINED') return;
      }
    }
  }
}

export default createRollupConfig;
