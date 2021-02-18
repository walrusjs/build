import babel from '@babel/core';
import path from 'path';
import fs from 'fs';
import readdirRecursive from 'fs-readdir-recursive';
import { transform, compile } from './transform';

/**
 *
 * @param src
 * @param dest
 */
export function chmod(src: string, dest: string): void {
  fs.chmodSync(dest, fs.statSync(src).mode);
}

export function withExtension(filename: string, ext: string = '.js') {
  const newBasename = path.basename(filename, path.extname(filename)) + ext;
  return path.join(path.dirname(filename), newBasename);
}

export function addSourceMappingUrl(code: string, loc: string): string {
  return code + "\n//# sourceMappingURL=" + path.basename(loc);
}

/**
 * 判断是否以可编译的扩展名结尾
 * @param filename
 * @param altExts
 */
export function isCompilableExtension(
  filename: string,
  altExts?: Array<string>,
): boolean {
  const exts = altExts || babel.DEFAULT_EXTENSIONS;
  const ext = path.extname(filename);
  return exts.includes(ext);
}

/**
 * 递归删除目录
 * @param path
 */
export function deleteDir(path: string): void {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file) {
      const curPath = path + '/' + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteDir(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

type ReaddirFilter = (filename: string) => boolean;

export function readdir(
  dirname: string,
  includeDotfiles: boolean,
  filter?: ReaddirFilter,
): Array<string> {
  // @ts-ignore
  return readdirRecursive(dirname, (filename, _index, currentDirectory) => {
    const stat = fs.statSync(path.join(currentDirectory, filename));

    if (stat.isDirectory()) return true;

    return (
      (includeDotfiles || filename[0] !== ".") && (!filter || filter(filename))
    );
  });
}

export {
  compile,
  transform
}

