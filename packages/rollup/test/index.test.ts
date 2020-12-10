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
    entries,
    cwd
  }: { title: string; entries?: string | string[]; cwd?: string },
  config?: Config
) {
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
  title: 'alias',
  cwd: fixture('alias')
});

snapshot({
  title: 'alias-default',
  cwd: fixture('alias-default')
});

// snapshot({
//   title: 'basic',
//   cwd: fixture('basic')
// })

// snapshot({
//   title: 'basic-ts',
//   cwd: fixture('basic-ts')
// })

