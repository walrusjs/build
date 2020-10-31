import { join } from 'path';
import build from './';

const fixtures = join(__dirname, '..', 'fixtures');

test('normal', async () => {
  const cwd = join(fixtures, 'basic');

  console.log(cwd);

  // await build({ cwd, format: 'es,cjs,umd' });

  await build({ cwd, format: 'es' });

  expect(1).toEqual(1);
})