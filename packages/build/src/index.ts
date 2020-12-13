// @ts-ignore
import RollupBundler, { Config } from '@walrus/rollup';

export interface Opts extends Config {
  watch?: boolean;
}

async function build(opts: Opts) {
  const bundler = new RollupBundler(opts);

  try {
    if (opts.watch === true) {
      await bundler.run({ watch: opts.watch });
    } else {
      await bundler.run();
    }
    return 'success';
  } catch (e) {
    return e;
  }
}

export default build;

