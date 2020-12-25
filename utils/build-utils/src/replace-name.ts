import path from 'path';

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
