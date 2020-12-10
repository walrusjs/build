import path from 'path';
import { InputOptions, OutputOptions } from 'rollup';
import { getMain } from '../utils';
import { NormalizedConfig, Format } from '../types';
import getPlugins from './get-plugins';

interface CreateRollupConfigResult {
  inputOptions: InputOptions;
  outputOptions: OutputOptions;
}

interface CreateRollupConfigOpts {
  entry: string;
  format: Format;
  config: NormalizedConfig;
}

/**
 * 获取Rollup配置
 */
const createConfig = (
  {
    entry,
    format,
    config
 }: CreateRollupConfigOpts,
 writeMeta: boolean
): CreateRollupConfigResult => {
  const { output, multipleEntries, cwd, pkg } = config;
  const useTypescript = path.extname(entry) === '.ts' || path.extname(entry) === '.tsx';

  let outputAliases: Record<string, string> = {};
	// since we transform src/index.js, we need to rename imports for it:
	if (multipleEntries) {
		outputAliases['.'] = './' + path.basename(output as string);
  }

  const absMain = path.resolve(cwd, getMain({
    options: config,
    entry,
    format
  }));
  const outputDir = path.dirname(absMain);
  const outputEntryFileName = path.basename(absMain);

  const plugins = getPlugins(
    {
      format,
      config,
      useTypescript
    },
    writeMeta
  );

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
    strict: config.strict === true,
    freeze: false,
    esModule: false,
    dir: outputDir,
    entryFileNames: outputEntryFileName
  }

  return {
    inputOptions,
    outputOptions
  }
}

export default createConfig;
