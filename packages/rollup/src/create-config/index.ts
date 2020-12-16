import path from 'path';
import { InputOptions, OutputOptions } from 'rollup';
import { getMain, getExternalTest } from '../utils';
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

  let external = ['dns', 'fs', 'path', 'url'].concat(
		config.entries.filter((e: string) => e !== entry),
  );
  const aliasIds = config.alias.map(alias => alias.find);

  const externalTest = getExternalTest(external);

  const inputOptions: InputOptions = {
    input: entry,
    external: id => {
      if (id === 'babel-plugin-transform-async-to-promises/helpers') {
        return false;
      }
      if (config.multipleEntries && id === '.') {
        return true;
      }
      if (aliasIds.indexOf(id) >= 0) {
        return false;
      }
      return externalTest(id);
    },
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
    sourcemap: config.sourcemap,
    freeze: false,
    esModule: false,
    name: config.name && config.name.replace(/^global\./, ''),
    extend: /^global\./.test(config.name as string),
    dir: outputDir,
    entryFileNames: outputEntryFileName
  }

  return {
    inputOptions,
    outputOptions
  }
}

export default createConfig;
