import build, { Opts } from './build';

const { getPackages } = require('@lerna/project');
const runTopologically = require("@lerna/run-topologically");

async function buildForLerna(opts: Opts) {
  const cwd = opts.cwd as string;
  const packages = await getPackages(cwd);

  if (opts.stream === true) {
    const packages = await getPackages(cwd);

    let runner = (pkg: any) => {
      return new Promise((resolve, reject) => {
        const pkgPath = pkg.contents;

        build({
          ...opts,
          cwd: pkgPath,
          rootPath: cwd
        }).then(
          result => {
            console.log(result);
            setTimeout(() => {
              resolve(result);
            }, 1000)
          },
          (error) => {
            reject(error);
          }
        )
      });
    }

    await runTopologically(
      packages,
      runner,
      {
        concurrency: 12,
      }
    );
    return;
  }

  for (const pkg of packages) {
    const pkgPath = pkg.contents;
    process.chdir(pkgPath);
    await build({
      ...opts,
      cwd: pkgPath,
      rootPath: cwd
    });
  }
}

export default buildForLerna;
