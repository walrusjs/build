import path from 'path';
import { promises } from 'fs-extra';
import { configLoader, isDir, isFile, getExistFile } from '@walrus/build-utils';
import { Format, NormalizedConfig } from '@walrus/build-types';

export const readFile = promises.readFile;
export const stat = promises.stat;

// eslint-disable-next-line no-console
export const stdout = console.log.bind(console);
export const stderr = console.error.bind(console);

/**
 * 替换文件名称
 * @param filename
 * @param name
 */
export function replaceName(filename: string, name: string) {
	return path.resolve(
		path.dirname(filename),
		name + path.basename(filename).replace(/^[^.]+/, ''),
	);
}

interface GetMainParams {
  format: Format;
  entry: string;
  options: NormalizedConfig;
}

export function getMain({
  options,
  entry,
  format
}: GetMainParams) {
  const { pkg } = options;
	let mainNoExtension: string = options.output as string;
	if (options.multipleEntries) {
		let name = entry.match(/([\\/])index(\.(umd|cjs|es|m))?\.(mjs|[tj]sx?)$/)
			? mainNoExtension
			: entry;
		mainNoExtension = path.resolve(path.dirname(mainNoExtension), path.basename(name));
	}
	mainNoExtension = mainNoExtension.replace(
		/(\.(umd|cjs|es|m))?\.(mjs|[tj]sx?)$/,
		'',
	);

	const mainsByFormat: Record<string, string> = {};

	mainsByFormat.esm = replaceName(
		pkg.module && !pkg.module.match(/src\//)
			? pkg.module
			: pkg['jsnext:main'] || 'x.esm.js',
		mainNoExtension,
	);
	// mainsByFormat.modern = replaceName(
	// 	(pkg.syntax && pkg.syntax.esmodules) || pkg.esmodule || 'x.modern.js',
	// 	mainNoExtension,
	// );
	mainsByFormat.cjs = replaceName(pkg['cjs:main'] || 'x.js', mainNoExtension);
	mainsByFormat.umd = replaceName(
		pkg['umd:main'] || pkg.unpkg || 'x.umd.js',
		mainNoExtension,
  );

	return mainsByFormat[format] || mainsByFormat.cjs;
}

export { configLoader, isDir, isFile, getExistFile };
export { default as babelCustom } from './babel-custom';
export { default as getExternalTest } from './get-external-test';
export { default as apiExtractor } from './api-extractor';
