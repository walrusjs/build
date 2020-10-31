import { promises } from 'fs';
import { resolve, dirname, basename } from 'path';
import { map } from 'asyncro';
import camelCase from 'camelcase';
import glob from 'tiny-glob/sync';

export const readFile = promises.readFile;
export const stat = promises.stat;

export const stdout = console.log.bind(console);
export const stderr = console.error.bind(console);

/**
 * 判断值不为空值
 * @param value 
 */
export function isTruthy(value: any) {
	if (!value) {
		return false;
	}

	return value.constructor !== Object || Object.keys(value).length > 0;
};

/**
 * 判断是否为目录
 * @param name 
 */
export function isDir(name: string): Promise<boolean> {
  return stat(name)
    .then(stats => stats.isDirectory())
		.catch(() => false);
}

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
 * Remove a @scope/ prefix from a package name string
 * @param name 
 */
export const removeScope = (name: string): string => {
	return name.replace(/^@.*\//, '')
};

const INVALID_ES3_IDENT = /((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g;

/**
 * Turn a package name into a valid reasonably-unique variable name
 * @param {string} name
 */
export function safeVariableName(name) {
	const normalized = removeScope(name).toLowerCase();
	const identifier = normalized.replace(INVALID_ES3_IDENT, '');
	return camelCase(identifier);
}


/**
 * 
 * @param cwd 
 * @param fileName 
 */
export async function jsOrTs(cwd: string, fileName: string) {
	const extension = (await isFile(resolve(cwd, fileName + '.ts')))
		? '.ts'
		: (await isFile(resolve(cwd, fileName + '.tsx')))
		? '.tsx'
		: '.js';

	return resolve(cwd, `${fileName}${extension}`);
}

interface GetInputOptions {
	entries: string | string[];
	cwd: string; 
	source: string[] | string;
	module: string;
}

/**
 * 获取入口文件
 * @param param 
 */
export async function getInput({ 
	entries, 
	cwd, 
	source, 
	module 
}: GetInputOptions): Promise<string[]> {
	const input: string[] = [];

	[].concat(
			entries && entries.length
				? entries
				: (source &&
						(Array.isArray(source) ? source : [source]).map(file =>
							resolve(cwd, file),
						)) ||
						((await isDir(resolve(cwd, 'src'))) &&
							(await jsOrTs(cwd, 'src/index'))) ||
						(await jsOrTs(cwd, 'index')) ||
						module,
		)
		.map(file => glob(file))
		.forEach(file => input.push(...file));

	return input;
}

interface GetOutputOptions {
	cwd: string;
	output: string; 
	pkgMain: string;
	pkgName: string;
}

/**
 * 获取输出
 * @param param
 */
export async function getOutput({ 
	cwd, 
	output, 
	pkgMain, 
	pkgName 
}: GetOutputOptions): Promise<string> {
	let main = resolve(cwd, output || pkgMain || 'dist');
	if (!main.match(/\.[a-z]+$/) || (await isDir(main))) {
		main = resolve(main, `${removeScope(pkgName)}.js`);
	}
	return main;
}

interface GetEntriesOptions {
	cwd: string;
	input: string | string[];
}

/**
 * 
 * @param param
 */
export async function getEntries({ 
	input, 
	cwd 
}: GetEntriesOptions) {
	let entries = (
		await map([].concat(input), async file => {
			file = resolve(cwd, file);
			if (await isDir(file)) {
				file = resolve(file, 'index.js');
			}
			return file;
		})
	).filter((item, i, arr) => arr.indexOf(item) === i);

	return entries;
}

export function replaceName(filename: string, name: string) {
	return resolve(
		dirname(filename),
		name + basename(filename).replace(/^[^.]+/, ''),
	);
}