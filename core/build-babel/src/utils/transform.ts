
import { transformFile, BabelFileResult, TransformOptions } from '@babel/core';

const CALLER = {
  name: '@walrus/build-babel',
};

/**
 * 转换文件
 * @param filename
 * @param opts
 */
export function transform(
  filename: string,
  opts: TransformOptions,
): Promise<BabelFileResult | null> {
  opts = {
    ...opts,
    caller: CALLER
  };

  return new Promise((resolve, reject) => {
    transformFile(filename, opts, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}
