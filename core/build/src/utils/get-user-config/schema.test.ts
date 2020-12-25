import AJV from 'ajv';
import schema from './schema';

const ajv = new AJV();

const successValidates = {
  cwd: ['.'],
  name: ['foo'],
  strict: [false, true],
  sourcemap: [false, true],
  format: ['esm', ['esm', 'cjs']],
  entries: ['./src/index.js', ['./src/index.js', './src/cli.ts']],
  tsconfig: ['./tsconfig.json'],
  output: ['dist'],
  compress: [false, true],
  target: ['node', 'browser'],
  disableTypeCheck: [false, true],
  replaceMode: ['rollup', 'babel']
};

Object.keys(successValidates).forEach(key => {
  test(key, () => {
    successValidates[key].forEach(item => {
      expect(
        ajv.validate(schema, {
          [key]: item,
        }),
      ).toEqual(true);
    });
  });
});
