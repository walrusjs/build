import path from 'path';
import normalizeConfig from '@walrus/normalize-build-config';
import Bundler from '../src';
import { NormalizedConfig, Config } from '../src/types';

function fixture(...args: string[]) {
  return path.join(__dirname, 'fixtures', ...args)
}

async function generate(config: Config) {
  const latestConfig = await normalizeConfig({
    cwd: config.cwd,
    config,
    pkg: {},
    hasPackageJson: false
  });
  console.log(latestConfig);
  return new Bundler(latestConfig)
}

function snapshot(
  config?: Partial<NormalizedConfig> & { title: string; }
) {
  const { title, ...rest } = config;
  it(title, async () => {
    expect.assertions(1);
    const bundler = await generate(
      {
        format: ['esm', 'cjs'],
        ...rest,
        cwd: fixture(title),
        sourcemap: false,
        compress: false,
      } as NormalizedConfig
    );

    await bundler.run();

    expect('Mark').toEqual('Mark');
  })
};

snapshot({
  title: 'alias',
  alias: [
    {
      find: './constants',
      replacement: './constants-debug'
    }
  ]
});

// snapshot({
//   title: 'basic'
// });
