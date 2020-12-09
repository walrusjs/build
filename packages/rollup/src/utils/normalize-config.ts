import path from 'path';
import { isArray, isString, isObject } from 'lodash';
import { Alias } from '@rollup/plugin-alias';
import { DEFAULT_INPUT_FILE } from '../config';
import { Config, NormalizedConfig, Format, PackageJson } from '../types';
import { getExistFile, isFile, getOutput } from './';

async function normalizeConfig(
  cwd: string,
  config: Config,
  pkg: PackageJson
): Promise<NormalizedConfig> {
  // normalize entries
  let entries: NormalizedConfig['entries'] = [];
  if (config.entries) {
    entries = isArray(config.entries)
      ? config.entries
      : (isString(config.entries))
        ? [config.entries]
        : []
  }

  if (!entries.length) {
    const input = getExistFile({
      cwd,
      files: DEFAULT_INPUT_FILE
    });

    input && (entries = [input]);
  }

  // normalize tsconfig
  if (!config.tsconfig) {
    config.tsconfig = path.join(cwd, 'tsconfig.json');
  }

  if (!await isFile(config.tsconfig)) {
    config.tsconfig = undefined;
  }

  // normalize format
  let formats: Format[] = [];
  if (config.format) {
    if (isString(config.format)) {
      // 支持'esm,cjs'配置
      formats = (config.format as string).split(',') as Format[];
    }

    if (isArray(config.format)) {
      formats = config.format;
    }
  }

  // normalize alias
  const moduleAlias: Alias[] = [
    {
      find: '@',
      replacement: path.resolve(cwd, 'src')
    }
  ];

  if (isObject(config.alias)) {
    Object.keys(config.alias).forEach(item => {
      const replacement = (config.alias as Record<string, string>)[item];

      moduleAlias.push({
        find: item,
        replacement
      })
    });
  }

  if (isArray(config.alias)) {
    moduleAlias.push(...config.alias);
  }

  // normalize output
  const output = await getOutput({
		cwd,
		output: config.output as string,
		pkgMain: pkg.main,
		pkgName: pkg.name,
  });

  return {
    cwd,
    entries,
    formats,
    tsconfig: config.tsconfig,
    alias: moduleAlias,
    output: output,
    multipleEntries: entries.length > 1,
  }
}

export default normalizeConfig;
