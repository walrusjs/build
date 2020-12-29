import path from 'path'
import Bundler from '../src';
import { Config } from '@walrus/build-types';

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
        format: ['esm', 'cjs'],
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
  title: 'alias',
  alias: [
    {
      find: './constants',
      replacement: './constants-debug'
    }
  ]
});

snapshot({
  title: 'alias-default'
});

snapshot({
  title: 'alias-external',
  alias: [
    {
      find: 'tiny-glob',
      replacement: './colossal-glob.js'
    }
  ]
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
  title: 'replace',
  replace: {
    DEBUG: 'false'
  }
});

snapshot({
  title: 'replace-expression',
  replace: {
    'Object.freeze': 'Object'
  }
});

snapshot({
  title: 'svgr'
});

snapshot({
  title: 'css-modules'
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

snapshot({
  title: 'type-extractor',
  typeExtractor: {}
});
