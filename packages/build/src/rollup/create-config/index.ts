import { InputOptions, OutputOptions } from 'rollup';
import { extname, basename, resolve, dirname } from 'path';
import getPlugins from './get-plugins';
import { Format, Config } from '@/types';
import { getMain } from '@/utils/resolve-options';

export interface CreateRollupConfigOptions extends Config {
  format?: Format;
}

interface CreateRollupConfigResult {
  inputOptions: InputOptions;
  outputOptions: OutputOptions;
}

/**
 * 获取Rollup配置
 */
const createRollupConfig = (
  options: Config,
  entry: string,
  format: Format,
  writeMeta: boolean
): CreateRollupConfigResult => {

  let outputAliases = {};
	// since we transform src/index.js, we need to rename imports for it:
	if (options.multipleEntries) {
		outputAliases['.'] = './' + basename(options.output);
	}

  const useTypescript = extname(entry) === '.ts' || extname(entry) === '.tsx';

  const absMain = resolve(options.cwd, getMain({ options, entry, format }));
  const outputDir = dirname(absMain);
  const outputEntryFileName = basename(absMain);

  const plugins: InputOptions['plugins']  = getPlugins({
    ...options,
    format,
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
    paths: outputAliases,
    format,
    sourcemap: options.sourcemap,
    name: options.name && options.name.replace(/^global\./, ''),
    extend: /^global\./.test(options.name),
    dir: outputDir,
    exports: 'auto',
    entryFileNames: outputEntryFileName
  }

  return {
    inputOptions,
    outputOptions
  }
}

export default createRollupConfig;
