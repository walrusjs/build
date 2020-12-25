import path from 'path';
import camelCase from 'camelcase';
import { isDir } from '@walrus/build-utils';

// eslint-disable-next-line no-console
export const stdout = console.log.bind(console);
export const stderr = console.error.bind(console);

interface GetOutputOpts {
  cwd: string;
  output: string;
  pkgMain?: string;
  pkgName?: string;
}

export async function getOutput({
  cwd,
  output,
  pkgMain,
  pkgName
}: GetOutputOpts) {
	let main = path.resolve(cwd, output || pkgMain || 'dist');
	if (!main.match(/\.[a-z]+$/) || (await isDir(main))) {
		main = path.resolve(main, `${removeScope(pkgName as string)}.js`);
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
