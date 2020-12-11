import path from 'path';
import camelCase from 'camelcase';
import { existsSync, promises } from 'fs-extra';
import { Format, PackageJson, NormalizedConfig } from '../types';

export const readFile = promises.readFile;
export const stat = promises.stat;

// eslint-disable-next-line no-console
export const stdout = console.log.bind(console);
export const stderr = console.error.bind(console);

/**
 * 判断是否为文件
 * @param name
 */
export function isFile(name: string): Promise<boolean> {
	return stat(name)
		.then(stats => stats.isFile())
		.catch(() => false);
}

/**
 * 判断是否为目录
 * @param name
 */
export function isDir(name: string): Promise<boolean> {
  return stat(name)
    .then(stats => stats.isDirectory())
		.catch(() => false);
}

interface GetOutputOpts {
  cwd: string;
  output: string;
  pkgMain: string;
  pkgName: string;
}

export async function getOutput({
  cwd,
  output,
  pkgMain,
  pkgName
}: GetOutputOpts) {
	let main = path.resolve(cwd, output || pkgMain || 'dist');
	if (!main.match(/\.[a-z]+$/) || (await isDir(main))) {
		main = path.resolve(main, `${removeScope(pkgName)}.js`);
	}
	return main;
}

/**
 * Remove a @scope/ prefix from a package name string
 * @param name
 */
export const removeScope = (name: string): string => {
	return name.replace(/^@.*\//, '')
};

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

/**
 * 按顺序获取文件
 * @param cwd 目录
 * @param files 获取的文件顺序
 * @param returnRelative
 */
export function getExistFile({
  cwd,
  files,
  returnRelative
}: {
  cwd: string;
  files: string[];
  returnRelative?: boolean;
}) {
  for (const file of files) {
    const absFilePath = path.join(cwd, file);
    if (existsSync(absFilePath)) {
      return returnRelative ? file : absFilePath;
    }
  }
}

export async function jsOrTs(cwd: string, filename: string) {
	const extension = (await isFile(path.resolve(cwd, filename + '.ts')))
		? '.ts'
		: (await isFile(path.resolve(cwd, filename + '.tsx')))
		? '.tsx'
    : '.js';
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

const INVALID_ES3_IDENT = /((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g;

/**
 * Turn a package name into a valid reasonably-unique variable name
 * @param {string} name
 */
export function safeVariableName(name: string) {
	const normalized = removeScope(name).toLowerCase();
	const identifier = normalized.replace(INVALID_ES3_IDENT, '');
	return camelCase(identifier);
}

export { default as clearConsole } from '@pansy/clear-console';
export { default as configLoader } from './config-loader';
export { default as normalizeConfig } from './normalize-config';
export { default as babelCustom } from './babel-custom';
export { default as getExternalTest } from './get-external-test';
