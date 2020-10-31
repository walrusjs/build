import { resolve, relative, dirname } from 'path';
import { blue } from 'kleur';
import { series } from 'asyncro';
import { rollup } from 'rollup';
import { getEntries, getOutput, getInput } from './utils';
import createConfig from './rollup/create-config';
import { getConfigFromPkgJson, getName } from './utils/package-info';
import doWatch from './rollup/do-watch';
import { Options } from './types';

export default async function build(inputOptions: Partial<Options>) {
  let options = { ...inputOptions };

  options.cwd = resolve(process.cwd(), inputOptions.cwd);
  const cwd = options.cwd;

  const { hasPackageJson, pkg } = await getConfigFromPkgJson(cwd);
  options.pkg = pkg;

  const { finalName, pkgName } = getName({
		name: options.name,
		pkgName: options.pkg.name,
		amdName: options.pkg.amdName,
		hasPackageJson,
		cwd,
  });
  
  options.name = finalName;
  options.pkg.name = pkgName;
  
  if (options.sourcemap !== false) {
		options.sourcemap = true;
  }
  
  options.input = await getInput({
		entries: options.entries,
		cwd,
		source: options.pkg.source,
		module: options.pkg.module,
  });
  
  options.output = await getOutput({
		cwd,
		output: options.output,
		pkgMain: options.pkg.main,
		pkgName: options.pkg.name,
  });
  
  options.entries = await getEntries({
		cwd,
		input: options.input,
  });
  
  options.multipleEntries = options.entries.length > 1;

  let formats = (options.format || options.formats).split(',');

  // de-dupe formats and convert "esm" to "es":
  formats = Array.from(new Set(formats.map(f => (f === 'esm' ? 'es' : f))));
  
  // always compile cjs first if it's there:
  formats.sort((a, b) => (a === 'cjs' ? -1 : a > b ? 1 : 0));
  
  let steps = [];

  for (let i = 0; i < options.entries.length; i++) {
		for (let j = 0; j < formats.length; j++) {
			steps.push(
				createConfig(
					options,
					options.entries[i],
					formats[j],
					i === 0 && j === 0,
				),
			);
		}
  }

  // console.log(options);
  // console.log(steps);
  // return;
  
  if (options.watch) {
		return doWatch(options, cwd, steps);
  }
  
  let cache;
	let out = await series(
		steps.map(config => async () => {
			const { inputOptions, outputOptions } = config;
			if (inputOptions.cache !== false) {
				inputOptions.cache = cache;
			}
			let bundle = await rollup(inputOptions);
			cache = bundle;
			await bundle.write(outputOptions);
			return await config._sizeInfo;
		}),
  );
  
  const targetDir = relative(cwd, dirname(options.output)) || '.';
	const banner = blue(`Build "${options.name}" to ${targetDir}:`);
	return {
		output: `${banner}\n   ${out.join('\n   ')}`,
	};
}