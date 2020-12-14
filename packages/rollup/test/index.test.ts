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

snapshot({
  title: 'basic'
});

snapshot({
  title: 'basic-css'
});

// snapshot({
//   title: 'basic-dashed-external'
// });

snapshot({
  title: 'basic-multi-source'
});

snapshot({
  title: 'basic-node-internals',
  target: 'node',
  format: ['cjs']
});

snapshot({
  title: 'class-decorators-ts'
});

snapshot({
  title: 'class-properties'
});

snapshot({
  title: 'basic-ts'
});

snapshot({
  title: 'basic-tsx'
});

snapshot({
  title: 'basic-json'
});

snapshot({
  title: 'replace'
});

snapshot({
  title: 'replace-expression'
});

snapshot({
  title: 'svgr'
});

snapshot({
  title: 'optional-chaining-ts'
});

snapshot({
  title: 'pretty'
});

snapshot({
  title: 'pure'
});

snapshot({
  title: 'shebang'
});

snapshot({
  title: 'ts-jsx'
});

snapshot({
  title: 'ts-mixed-exports'
});

snapshot({
  title: 'ts-module'
});
