import path from 'path'
import Bundler, { Config } from '../src';

function fixture(...args: string[]) {
  return path.join(__dirname, 'fixtures', ...args)
}

function generate(config: Config) {
  const bundler = new Bundler(config)
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
        entries,
        cwd,
        sourcemap: false
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

snapshot({
  title: 'async-iife-ts'
});

snapshot({
  title: 'async-ts'
});

// snapshot({
//   title: 'basic'
// });

// snapshot({
//   title: 'basic-ts'
// });

// snapshot({
//   title: 'basic-tsx'
// });

// snapshot({
//   title: 'basic-json'
// });

snapshot({
  title: 'svgr'
});
