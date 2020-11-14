import { resolve, join } from 'path';
import { build } from './';

describe('rollup build', () => {
  const fixtures = resolve(__dirname, '../../fixtures');

  it('alias', async () => {
    expect.assertions(1);
    const cwd = join(fixtures, 'alias');

    await build({
      cwd,
      alias: [
        {
          find: './constants',
          replacement: './constants-debug'
        }
      ]
    });

    expect('Mark').toEqual('Mark');
  });

  it('alias-external', async () => {
    expect.assertions(1);
    const cwd = join(fixtures, 'alias-external');

    await build({ cwd });

    expect('Mark').toEqual('Mark');
  });

  it('async-iife-ts', async () => {
    expect.assertions(1);
    const cwd = join(fixtures, 'async-iife-ts');

    await build({ cwd });

    expect('Mark').toEqual('Mark');
  });

  it('async-ts', async () => {
    expect.assertions(1);
    const cwd = join(fixtures, 'async-ts');

    await build({ cwd });

    expect('Mark').toEqual('Mark');
  });

  it('basic', async () => {
    expect.assertions(1);
    const cwd = join(fixtures, 'basic');

    await build({ cwd });

    expect('Mark').toEqual('Mark');
  });

  it('basic-css', async () => {
    expect.assertions(1);
    const cwd = join(fixtures, 'basic-css');

    await build({ cwd });

    expect('Mark').toEqual('Mark');
  });

  it('basic-less', async () => {
    expect.assertions(1);
    const cwd = join(fixtures, 'basic-less');

    await build({ cwd });

    expect('Mark').toEqual('Mark');
  });

  it('basic-node-internals', async () => {
    expect.assertions(1);
    const cwd = join(fixtures, 'basic-node-internals');

    await build({ cwd, target: 'node' });

    expect('Mark').toEqual('Mark');
  });

  it('basic-ts', async () => {
    expect.assertions(1);
    const cwd = join(fixtures, 'basic-ts');

    await build({ cwd });

    expect('Mark').toEqual('Mark');
  });

  it('basic-tsx', async () => {
    expect.assertions(1);
    const cwd = join(fixtures, 'basic-tsx');

    await build({ cwd });

    expect('Mark').toEqual('Mark');
  });

  it('css-modules-false', async () => {
    expect.assertions(1);
    const cwd = join(fixtures, 'css-modules-false');

    await build({ cwd, cssModules: false });

    expect('Mark').toEqual('Mark');
  });

  it('css-modules-true', async () => {
    expect.assertions(1);
    const cwd = join(fixtures, 'css-modules-true');

    await build({ cwd, cssModules: true });

    expect('Mark').toEqual('Mark');
  });

  it('ts-declaration', async () => {
    expect.assertions(1);
    const cwd = join(fixtures, 'ts-declaration');

    await build({ cwd });

    expect('Mark').toEqual('Mark');
  });
});
