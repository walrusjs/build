import path from 'path';
import { InputOptions, OutputOptions } from 'rollup';
import { getMain } from '../utils';
import { NormalizedConfig, Format, PackageJson } from '../types';
import getPlugins from './get-plugins';

interface CreateRollupConfigResult {
  inputOptions: InputOptions;
  outputOptions: OutputOptions;
}

interface CreateRollupConfigOpts {
  pkg: PackageJson;
  entry: string;
  format: Format;
  config: NormalizedConfig;
}

/**
 * 获取Rollup配置
 */
const createRollupConfig = ({
  entry,
  format,
  config,
  pkg
}: CreateRollupConfigOpts): CreateRollupConfigResult => {
  const { alias = [], output, multipleEntries, cwd } = config;
  const useTypescript = path.extname(entry) === '.ts' || path.extname(entry) === '.tsx';

  let outputAliases: Record<string, string> = {};
	// since we transform src/index.js, we need to rename imports for it:
	if (multipleEntries) {
		outputAliases['.'] = './' + path.basename(output as string);
  }

  const absMain = path.resolve(cwd, getMain({
    options: config,
    pkg,
    entry,
    format
  }));

  const plugins = getPlugins({
    format,
    config,
    useTypescript
  });

  const inputOptions: InputOptions = {
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

  const outputOptions: OutputOptions = {
    format,
    exports: 'auto',
  }

  return {
    inputOptions,
    outputOptions
  }
}

export default createRollupConfig;
