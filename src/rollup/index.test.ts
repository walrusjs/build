import { resolve, join } from 'path';
import build from './';

describe('rollup build', () => {
  const fixtures = resolve(__dirname, '../../fixtures');

  it('alias', async () => {
    expect.assertions(1);
    const cwd = join(fixtures, 'alias');

    await build({ cwd });

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

  it('basic-node-internals', async () => {
    expect.assertions(1);
    const cwd = join(fixtures, 'basic-node-internals');

    await build({ cwd, target: 'node' });

    expect('Mark').toEqual('Mark');
  });

  it('ts-declaration', async () => {
    expect.assertions(1);
    const cwd = join(fixtures, 'ts-declaration');

    await build({ cwd });

    expect('Mark').toEqual('Mark');
  });

});
