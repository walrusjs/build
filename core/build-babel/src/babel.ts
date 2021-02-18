import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import slash from 'slash';
import { $Keys } from '@pansy/types';
import { TransformOptions } from '@babel/core';
import { LiteralUnion } from '@pansy/types/dist/literal-union';
import {
  transform,
  readdir,
  chmod,
  withExtension,
  addSourceMappingUrl,
  isCompilableExtension
} from './utils';
import { BabelOptions } from './types';

const FILE_TYPE = Object.freeze({
  NON_COMPILABLE: 'NON_COMPILABLE',
  COMPILED: 'COMPILED',
  IGNORED: 'IGNORED',
  ERR_COMPILATION: 'ERR_COMPILATION',
});

type FILE_TYPE = LiteralUnion<$Keys<typeof FILE_TYPE>, string>;

export default async function (
  opts: Required<BabelOptions> & { buildDirs: string[] },
  transformOpts: TransformOptions
) {
  const { buildDirs } = opts;
  let compiledFiles = 0;
  let startTime: [number, number] | null = null;

  /** 创建输出目录 */
  fs.mkdirSync( opts.outDir, { recursive: true });

  startTime = process.hrtime();

   /** 编译及拷贝 */
  for (const buildDir of buildDirs) {
    compiledFiles += await handle(buildDir);
  }

  /** 监听 */
  if (opts.watch) {
    buildDirs.forEach(function (filenameOrDir: string): void {
      const watcher = chokidar.watch(filenameOrDir, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 50,
          pollInterval: 10,
        },
      });

      let processing = 0;

      ['add', 'change'].forEach(function (type: string): void {
        watcher.on(type, async function (filename: string) {
          processing++;
          if (startTime === null) startTime = process.hrtime();

          try {
            await handleFile(
              filename,
              filename === filenameOrDir
                ? path.dirname(filenameOrDir)
                : filenameOrDir,
            );

            compiledFiles++;
          } catch (err) {
            console.error(err);
          }

          processing--;
          // if (processing === 0 && !opts.quiet) logSuccess();
        });
      });
    });
  }

  // ----------------------functions------------------------

  function getDest(filename: string, base: string): string {
    if (opts.relative) {
      return path.join(base, opts.outDir, filename);
    }
    return path.join(opts.outDir, filename);
  }

  function outputFileSync(filePath: string, data: string | Buffer): void {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, data);
  }

  async function write(
    src: string,
    base: string,
  ): Promise<FILE_TYPE> {
    let relative = path.relative(base, src);

    if (!isCompilableExtension(relative, opts.extensions)) {
      return FILE_TYPE.NON_COMPILABLE;
    }

    relative = withExtension(
      relative,
      opts.keepFileExtension
        ? path.extname(relative)
        : opts.outFileExtension,
    );

    const dest = getDest(relative, base);

    try {
      const res = await transform(src, {
        ...transformOpts,
        sourceFileName: slash(path.relative(dest + '/..', src)),
      });

      if (!res) return FILE_TYPE.IGNORED;

      // we've requested explicit sourcemaps to be written to disk
      if (
        res.map &&
        opts.sourceMaps &&
        opts.sourceMaps !== 'inline'
      ) {
        const mapLoc = dest + '.map';
        res.code = addSourceMappingUrl(res.code as string, mapLoc);
        res.map.file = path.basename(relative);
        outputFileSync(mapLoc, JSON.stringify(res.map));
      }

      outputFileSync(dest, res.code as string);
      chmod(src, dest);

      if (opts.verbose) {
        console.log(src + " -> " + dest);
      }

      return FILE_TYPE.COMPILED;
    } catch (err) {
      if (opts.watch) {
        console.error(err);
        return FILE_TYPE.ERR_COMPILATION;
      }

      throw err;
    }
  }

  async function handleFile(src: string, base: string): Promise<boolean> {
    const written = await write(src, base);

    if (
      (opts.copyFiles && written === FILE_TYPE.NON_COMPILABLE) ||
      (opts.copyIgnored && written === FILE_TYPE.IGNORED)
    ) {
      const filename = path.relative(base, src);
      const dest = getDest(filename, base);
      outputFileSync(dest, fs.readFileSync(src));
      chmod(src, dest);
    }
    return written === FILE_TYPE.COMPILED;
  }

  async function handle(filenameOrDir: string): Promise<number> {
    if (!fs.existsSync(filenameOrDir)) return 0;

    const stat = fs.statSync(filenameOrDir);

    if (stat.isDirectory()) {
      const dirname = filenameOrDir;

      let count = 0;

      const files = readdir(dirname, opts.includeDotfiles);

      for (const filename of files) {
        const src = path.join(dirname, filename);

        const written = await handleFile(src, dirname);
        if (written) count += 1;
      }

      return count;
    } else {
      const filename = filenameOrDir;
      const written = await handleFile(filename, path.dirname(filename));

      return written ? 1 : 0;
    }
  }

}
