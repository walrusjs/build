import path from 'path'
import bundler, { Config } from '../src';

function fixture(...args: string[]) {
  return path.join(__dirname, 'fixtures', ...args)
}

function generate(config: Config) {
  return bundler(config)
}

function snapshot(
  config?: Config & { title: string; }
) {
  const { title, ...rest } = config;
  test(title, async () => {
    await generate(
      {
        ...rest,
        cwd: fixture(title),
        sourcemap: false,
        compress: false,
      }
    )

    expect('Mark').toEqual('Mark');
  })
}

// snapshot({
//   title: 'alias'
// });

snapshot({
  title: 'lerna'
});
