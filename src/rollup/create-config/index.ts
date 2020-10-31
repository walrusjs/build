import { InputOptions, OutputOptions, ExternalOption } from 'rollup';
import builtinModules from 'builtin-modules';
import { basename, dirname } from 'path';
import camelCase from 'camelcase';
import escapeStringRegexp from 'escape-string-regexp';
import { InternalOptions, Format } from '@/types';
import { isString } from 'lodash';
import { stdout } from '@/utils';
import { MinifyOptions } from '@/types';
import {
	parseAliasArgument,
	parseMappingArgument,
	toReplacementExpression,
} from './option-normalization';
import { normalizeMinifyOptions } from './terser';
import getPlugins, { NameCache } from './get-plugins';

interface CreateConfigResult {
	inputOptions: InputOptions;
	outputOptions: OutputOptions;
}

const escapeStringExternals = (ext) => {
  return ext instanceof RegExp ? ext.source : escapeStringRegexp(ext);
}

function getMain({ options, entry, format }) {
	const { pkg } = options;
	const pkgMain = options['pkg-main'];

	if (!pkgMain) {
		return options.output;
	}

	let mainNoExtension = options.output;
	if (options.multipleEntries) {
		let name = entry.match(/([\\/])index(\.(umd|cjs|es|m))?\.(mjs|[tj]sx?)$/)
			? mainNoExtension
			: entry;
		mainNoExtension = resolve(dirname(mainNoExtension), basename(name));
	}
	mainNoExtension = mainNoExtension.replace(
		/(\.(umd|cjs|es|m))?\.(mjs|[tj]sx?)$/,
		'',
	);

	const mainsByFormat: { es?: string; modern?: string; cjs?: string; umd?: string } = {};

	mainsByFormat.es = replaceName(
		pkg.module && !pkg.module.match(/src\//)
			? pkg.module
			: pkg['jsnext:main'] || 'x.esm.js',
		mainNoExtension,
	);
	mainsByFormat.modern = replaceName(
		(pkg.syntax && pkg.syntax.esmodules) || pkg.esmodule || 'x.modern.js',
		mainNoExtension,
	);
	mainsByFormat.cjs = replaceName(pkg['cjs:main'] || 'x.js', mainNoExtension);
	mainsByFormat.umd = replaceName(
		pkg['umd:main'] || pkg.unpkg || 'x.umd.js',
		mainNoExtension,
	);

	return mainsByFormat[format] || mainsByFormat.cjs;
}

function createConfig(
  options: InternalOptions, 
	entry: string, 
	format: Format, 
	writeMeta: boolean
): CreateConfigResult {
  const pkg = options.pkg || {};

  const peerDeps = Object.keys(pkg.peerDependencies || {});

  // ----- 
  let external: ExternalOption = ['dns', 'fs', 'path', 'url'].concat(
		options.entries.filter(e => e !== entry),
  );
  
  if (options.target === 'node') {
		external = external.concat(builtinModules);
  }
  
  if (options.external === 'none') {
    // bundle everything (external=[])
  } else if (options.external) {
    external = external.concat(peerDeps)

    if (isString(options.external)) {
      external.concat(
        options.external.split(',').map(str => new RegExp(str)),
      );
    }
  } else {
		external = external
			.concat(peerDeps)
			.concat(Object.keys(pkg.dependencies || {}));
  }
  
  const externalPredicate = new RegExp(
    `^(${external.map(escapeStringExternals).join('|')})($|/)`,
  );

  const externalTest = external.length === 0 ? id => false : id => externalPredicate.test(id);

  // ------
  const isModern: boolean = format === 'modern';
  let cache: InputOptions['cache'];

  if (isModern) {
    cache = false;
  }

  // ------
	let defines: any = {};
	if (options.define) {
		defines = Object.assign(
			defines,
			parseMappingArgument(options.define, toReplacementExpression),
		);
	}

  // ------
  const moduleAliases = isString(options.alias) ? parseAliasArgument(options.alias) : [];
  const aliasIds = moduleAliases.map(alias => alias.find).filter(Boolean);
  
  // ------
  let nameCache: NameCache = {};
  const bareNameCache = nameCache;
  const rawMinifyValue = options.pkg.minify || options.pkg.mangle || {};
  let minifyOptions: MinifyOptions = typeof rawMinifyValue === 'string' ? {} : rawMinifyValue;

  const getNameCachePath =
  typeof rawMinifyValue === 'string'
    ? () => resolve(options.cwd, rawMinifyValue)
    : () => resolve(options.cwd, 'mangle.json');

  function loadNameCache() {
    try {
      nameCache = JSON.parse(fs.readFileSync(getNameCachePath(), 'utf8'));
      // mangle.json can contain a "minify" field, same format as the pkg.mangle:
      if (nameCache.minify) {
        minifyOptions = Object.assign(
          {},
          minifyOptions || {},
          nameCache.minify,
        );
      }
    } catch (e) {}
  }
  loadNameCache();

  normalizeMinifyOptions(minifyOptions);

  if (nameCache === bareNameCache) nameCache = null;

  // 设置
  const inputOptions: InputOptions = {
    cache,
    input: entry,
    external: (source: string) => {
      if (source === 'babel-plugin-transform-async-to-promises/helpers') {
        return false;
      }
      if (options.multipleEntries && source === '.') {
        return true;
      }
      if (aliasIds.includes(source)) {
        return false;
      }
      return externalTest(source);
    },
    onwarn(warning, warn) {
      if (warning.code === 'UNRESOLVED_IMPORT') {
        stdout(
          `Failed to resolve the module ${warning.source} imported by ${warning.importer}` +
            `\nIs the module installed? Note:` +
            `\n ↳ to inline a module into your bundle, install it to "devDependencies".` +
            `\n ↳ to depend on a module via import/require, install it to "dependencies".`,
        );
        return;
      }

      warn(warning);
    },
    treeshake: {
      propertyReadSideEffects: false,
    },
    plugins: getPlugins({ 
      ...options, 
      format, 
      defines,
      entry,
      nameCache,
      writeMeta,
      minifyOptions,
      moduleAliases, 
    })
  };

  // ------

  let outputAliases = {};
	// since we transform src/index.js, we need to rename imports for it:
	if (options.multipleEntries) {
		outputAliases['.'] = './' + basename(options.output);
  }
  
  let globals = external.reduce((globals, name) => {
		// Use raw value for CLI-provided RegExp externals:
		// @ts-ignore
		if (name instanceof RegExp) name = name.source;

		// valid JS identifiers are usually library globals:
		if (name.match(/^[a-z_$][a-z0-9_\-$]*$/)) {
			globals[name] = camelCase(name);
		}
		return globals;
	}, {});
	if (options.globals && options.globals !== 'none') {
		globals = Object.assign(globals, parseMappingArgument(options.globals));
  }
  
  const absMain = resolve(options.cwd, getMain({ options, entry, format }));
	const outputDir = dirname(absMain);
	const outputEntryFileName = basename(absMain);

  const outputOptions: OutputOptions = {
    paths: outputAliases,
    globals,
    strict: options.strict === true,
    freeze: false,
    esModule: false,
    sourcemap: options.sourcemap,
    // @ts-ignore
    // get banner() {
    //   return shebang[options.name];
    // },
    format: modern ? 'es' : format,
    name: options.name && options.name.replace(/^global\./, ''),
    extend: /^global\./.test(options.name),
    dir: outputDir,
    entryFileNames: outputEntryFileName,
  };

  return {
    inputOptions,
    outputOptions
  }
}

export default createConfig;

