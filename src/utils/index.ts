import { promises, existsSync } from 'fs';
import { resolve, dirname, basename, join } from 'path';
import { map } from 'asyncro';
import camelCase from 'camelcase';

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

export function replaceName(filename: string, name: string) {
	return resolve(
		dirname(filename),
		name + basename(filename).replace(/^[^.]+/, ''),
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
    const absFilePath = join(cwd, file);
    if (existsSync(absFilePath)) {
      return returnRelative ? file : absFilePath;
    }
  }
}
