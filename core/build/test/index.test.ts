import path from 'path';
import { Config } from '@walrus/build-types';
import bundler from '../src';

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
  title: 'rollup-alias'
});

snapshot({
  title: 'rollup-alias-default'
});

snapshot({
  title: 'rollup-alias-external'
});

snapshot({
  title: 'rollup-async-iife-ts'
});

snapshot({
  title: 'rollup-async-ts'
});

snapshot({
  title: 'rollup-banner'
});

snapshot({
  title: 'rollup-basic'
});

snapshot({
  title: 'rollup-basic-css'
});

snapshot({
  title: 'rollup-basic-dashed-external'
});

snapshot({
  title: 'rollup-basic-json'
});

snapshot({
  title: 'rollup-basic-multi-source'
});

snapshot({
  title: 'rollup-basic-node-internals'
});

snapshot({
  title: 'rollup-basic-ts'
});

snapshot({
  title: 'rollup-basic-tsx'
});

snapshot({
  title: 'rollup-class-decorators-ts'
});

snapshot({
  title: 'rollup-class-properties'
});

snapshot({
  title: 'rollup-css-modules'
});

snapshot({
  title: 'rollup-css-modules'
});

snapshot({
  title: 'rollup-lerna'
});

snapshot({
  title: 'rollup-optional-chaining-ts'
});

snapshot({
  title: 'rollup-pretty'
});

snapshot({
  title: 'rollup-pure'
});

snapshot({
  title: 'rollup-replace'
});

snapshot({
  title: 'rollup-replace-expression'
});

snapshot({
  title: 'rollup-shebang'
});

snapshot({
  title: 'rollup-svgr'
});

snapshot({
  title: 'rollup-ts-jsx'
});

snapshot({
  title: 'rollup-ts-mixed-exports'
});

snapshot({
  title: 'rollup-ts-module'
});
