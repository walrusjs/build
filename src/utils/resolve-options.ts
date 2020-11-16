import { resolve, dirname, basename } from 'path';
import { map } from 'asyncro';
import glob from 'tiny-glob/sync';
import { DEFAULT_INPUT_FILE } from '@/config';
import { isDir, isFile, getExistFile, removeScope, replaceName } from './';

interface GetEntriesOption {
  cwd: string;
  input: string[];
}

/**
 *
 * @param param0
 */
export async function getEntries({ input, cwd }: GetEntriesOption) {
	let entries = (
		await map([].concat(input), async file => {
			file = resolve(cwd, file);
			if (await isDir(file)) {
				file = resolve(file, 'index.js');
      }
      if (await isFile(file)) {
        return file;
      }
      return undefined;
		})
  )
  .filter((item, i, arr) => arr.indexOf(item) === i)
  .filter(Boolean);
	return entries;
}

interface GetInputOptions {
  cwd: string;
	entries: string[];
	source: string[] | string;
}

/**
 * 获取输入配置
 * 优先级 配置 > package.source > default
 * @param param0
 */
export async function getInput({
  entries,
  cwd,
  source
}: GetInputOptions) {
  const input: string[] = [];

  const defaultEntry = getExistFile({
    cwd,
    files: DEFAULT_INPUT_FILE,
    // returnRelative: true
  });

	[]
		.concat(
			(entries && entries.length)
				? entries
				: (
            source &&
            (
              Array.isArray(source) ? source : [source])
              .map(file =>
                resolve(cwd, file),
            )
          ) || [defaultEntry]
		)
		.map(file => glob(file))
		.forEach(file => input.push(...file));

	return input;
}

/**
 * 获取输出
 * @param param0
 */
export async function getOutput({ cwd, output, pkgMain, pkgName }) {
	let main = resolve(cwd, output || pkgMain || 'dist');
	if (!main.match(/\.[a-z]+$/) || (await isDir(main))) {
		main = resolve(main, `${removeScope(pkgName)}.js`);
	}
	return main;
}

export function getMain({ options, entry, format }) {
	const { pkg } = options;

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

	const mainsByFormat: any = {};

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

