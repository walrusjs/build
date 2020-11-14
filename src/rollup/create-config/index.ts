import { InputOptions } from 'rollup';
import { extname } from 'path';
import getPlugins from './get-plugins';
import { getExistFile } from '../../utils';
import { Format } from '../../types';

interface Options {
  cwd: string;
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


const createRollupConfig = (opts: Options): CreateRollupConfigResult => {
  const cwd = opts.cwd;

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
      plugins
    }
  }
}

export default createRollupConfig;
