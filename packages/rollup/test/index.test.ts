import path from 'path'
import Bundler, { Options, Config } from '../src';

function fixture(...args: string[]) {
  return path.join(__dirname, 'fixtures', ...args)
}

function generate(config: Config, options: Options) {
  const bundler = new Bundler(config, {
    logLevel: 'quiet',
    ...options
  })
  return bundler.run()
}

function snapshot(
  {
    title,
    entries
  }: { title: string; entries?: string | string[]; },
  config?: Config
) {
  const cwd = fixture(title);
  test(title, async () => {
    await generate(
      {
        ...config,
        entries
      },
      {
        rootDir: cwd
      }
    )

    expect('Mark').toEqual('Mark');
  })
}

snapshot({
  title: 'alias'
});

snapshot({
  title: 'alias-default'
});

snapshot({
  title: 'alias-external'
});

// snapshot({
//   title: 'basic',
//   cwd: fixture('basic')
// })

// snapshot({
//   title: 'basic-ts',
//   cwd: fixture('basic-ts')
// })

