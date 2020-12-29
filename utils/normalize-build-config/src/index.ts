import path from 'path';
import { isArray, isString, isPlainObject } from 'lodash';
import { Alias } from '@rollup/plugin-alias';
import { yellow } from 'kleur';
import { DEFAULT_INPUT_FILE, ALL_FORMATS } from './config';
import { Config, NormalizedConfig, Format } from '@walrus/build-types';
import { getExistFile, isFile, configLoader } from '@walrus/build-utils';
import { stderr, getOutput, safeVariableName } from './utils';

interface Opts {
  cwd: string;
  config: Config;
  pkg: NormalizedConfig['pkg'];
  hasPackageJson: boolean;
}

async function normalizeConfig({
  cwd,
  pkg,
  config,
  hasPackageJson
}: Opts): Promise<NormalizedConfig> {
  let {
    name,
    tsconfig,
    strict,
    compress,
    sourcemap,
    replace,
    output,
    alias,
    banner,
    cssModules,
    typeExtractor,
    format: formatConfig,
    entries: entriesConfig,
    replaceMode = 'babel',
    target = 'browser'
  } = config ?? {};

  // normalize entries
  let entries: NormalizedConfig['entries'] = [];
  if (entriesConfig) {
    entries = isArray(entriesConfig)
      ? entriesConfig
      : (isString(entriesConfig))
        ? [entriesConfig]
        : []
  }

  const { finalName, pkgName } = getName({
		name,
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
  if (!tsconfig) {
    tsconfig = path.join(cwd, 'tsconfig.json');
  }

  // 支持向上查找tsconfig.json
  if (!await isFile(tsconfig)) {
    tsconfig = (configLoader
      .loadSync({
        files: ['tsconfig.json'],
        cwd
      })).path;
  }

  // normalize format
  // config > pkg.source > default
  let formats: Format[] = [];
  if (formatConfig) {
    if (isString(formatConfig)) {
      // 支持'esm,cjs'配置
      formats = (formatConfig as string).split(',') as Format[];
    }

    if (isArray(formatConfig)) {
      formats = formatConfig;
    }
  }
	// de-dupe formats and convert "esm" to "es":
  formats = Array
    .from(new Set(formats))
    .filter(item => ALL_FORMATS.includes(item));
	formats.sort((a, b) => (a === 'cjs' ? -1 : a > b ? 1 : 0));

  // normalize alias
  const moduleAlias: Alias[] = [
    {
      find: '@',
      replacement: path.resolve(cwd, 'src')
    }
  ];

  if (isPlainObject(alias) && alias) {
    Object.keys(alias).forEach(item => {
      const replacement = (alias as Record<string, string>)[item];

      moduleAlias.push({
        find: item,
        replacement
      })
    });
  }

  if (isArray(alias)) {
    moduleAlias.push(...alias);
  }

  // normalize output
  const latestOutput = await getOutput({
		cwd,
		output: output as string,
		pkgMain: pkg.main,
		pkgName: pkg.name,
  });

  const normalizedConfig: NormalizedConfig = {
    cwd,
    pkg,
    name: finalName,
    banner,
    entries,
    formats,
    tsconfig,
    alias: moduleAlias,
    output: latestOutput,
    hasPackageJson,
    multipleEntries: entries.length > 1,
    target: target,
    strict: !!strict,
    compress: !!compress,
    sourcemap: !!sourcemap,
    replace,
    cssModules,
    replaceMode,
    typeExtractor: isPlainObject(typeExtractor)
      ? { files: ['index.d.ts'], ...typeExtractor }
      : false,
  }

  normalizedConfig.pkg.name = pkgName;

  return normalizedConfig
}

interface GetNameOpts {
  name?: string;
  pkgName?: string;
  amdName?: string,
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
