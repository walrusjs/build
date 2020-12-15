import path from 'path';
import { isArray, isString, isPlainObject } from 'lodash';
import { Alias } from '@rollup/plugin-alias';
import { yellow } from 'kleur';
import { DEFAULT_INPUT_FILE } from './config';
import { Config, NormalizedConfig, Format, PackageJson } from '../types';
import { getExistFile, isFile, configLoader } from '../';
import { stderr, getOutput, safeVariableName } from './utils';

interface Opts {
  cwd: string,
  config: Config,
  pkg: PackageJson
  hasPackageJson: boolean;
}

async function normalizeConfig({
  cwd,
  pkg,
  config,
  hasPackageJson
}: Opts): Promise<NormalizedConfig> {
  // normalize entries
  let entries: NormalizedConfig['entries'] = [];
  if (config.entries) {
    entries = isArray(config.entries)
      ? config.entries
      : (isString(config.entries))
        ? [config.entries]
        : []
  }

  const { finalName, pkgName } = getName({
		name: config.name,
		pkgName: pkg.name,
		amdName: pkg.amdName,
		hasPackageJson,
		cwd,
  });

  if (!entries.length) {
    const source = pkg.source;

    const input: string[] = source
      ? (Array.isArray(source) ? source : [source]).map((file: string) => path.resolve(cwd, file))
      : [
        getExistFile({
          cwd,
          files: DEFAULT_INPUT_FILE
        })
      ].filter(Boolean) as string[];

    !!input.length && (entries = input);
  }

  // normalize tsconfig
  if (!config.tsconfig) {
    config.tsconfig = path.join(cwd, 'tsconfig.json');
  }

  // 支持向上查找tsconfig.json
  if (!await isFile(config.tsconfig)) {
    config.tsconfig = (configLoader
      .loadSync({
        files: ['tsconfig.json'],
        cwd
      })).path;
  }

  // normalize format
  // config > pkg.source > default
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
	// de-dupe formats and convert "esm" to "es":
	formats = Array.from(new Set(formats.map(f => {
    if (f === 'esm') {
      return 'es' as Format;
    }
    return f;
  })));
	formats.sort((a, b) => (a === 'cjs' ? -1 : a > b ? 1 : 0));

  // normalize alias
  const moduleAlias: Alias[] = [
    {
      find: '@',
      replacement: path.resolve(cwd, 'src')
    }
  ];

  if (isPlainObject(config.alias) && config.alias) {
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

  const normalizedConfig: NormalizedConfig = {
    cwd,
    pkg,
    name: finalName,
    entries,
    formats,
    tsconfig: config.tsconfig,
    alias: moduleAlias,
    output: output,
    hasPackageJson,
    multipleEntries: entries.length > 1,
    target: config.target ?? 'browser',
    strict: !!config.strict,
    compress: !!config.compress,
    sourcemap: !!config.sourcemap,
    replace: config.replace,
    replaceMode: config.replaceMode ?? 'babel'
  }

  normalizedConfig.pkg.name = pkgName;

  return normalizedConfig
}

interface GetNameOpts {
  name?: string;
  pkgName: string;
  amdName: string,
  cwd: string,
  hasPackageJson: boolean
}

export function getName({
  name,
  pkgName,
  amdName,
  cwd,
  hasPackageJson
}: GetNameOpts) {
	if (!pkgName) {
		pkgName = path.basename(cwd);
		if (hasPackageJson) {
			stderr(
				yellow().inverse('WARN'),
				yellow(` missing package.json "name" field. Assuming "${pkgName}".`),
			);
		}
	}

	const finalName = name || amdName || safeVariableName(pkgName);

	return { finalName, pkgName };
}

export default normalizeConfig;
