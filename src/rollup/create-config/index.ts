import { InputOptions } from 'rollup';
import { extname } from 'path';
import getPlugins from './get-plugins';
import { getExistFile } from '@/utils';
import { Format, Config } from '@/types';

export interface CreateRollupConfigOptions extends Config {
  format?: Format;
}

interface CreateRollupConfigResult {
  inputOptions: InputOptions,
}

export const DEFAULT_INPUT_FILE = [
  'src/index.tsx',
  'src/index.ts',
  'src/index.jsx',
  'src/index.js'
];


const createRollupConfig = (opts: CreateRollupConfigOptions): CreateRollupConfigResult => {
  const { cwd, target } = opts;

  // 默认输入文件
  const entry = getExistFile({
    cwd,
    files: DEFAULT_INPUT_FILE
  });

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
