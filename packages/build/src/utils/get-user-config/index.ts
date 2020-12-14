import path from 'path';
import AJV from 'ajv';
import { DEFAULT_CONFIG_FILE } from '../../config';
import { configLoader } from '../';
import schema from './schema';

const slash = require('slash');

export default function(cwd: string) {
  const {
    data = {},
    path: configFilePath
  } = configLoader.loadSync({
    files: DEFAULT_CONFIG_FILE,
    cwd: cwd,
    packageKey: 'wb'
  });

  if (configFilePath) {
    const ajv = new AJV({ allErrors: true });
    const isValid = ajv.validate(schema, data);
    if (!isValid) {
      const errors = ajv?.errors?.map(({ dataPath, message }, index) => {
        return `${index + 1}. ${dataPath}${dataPath ? ' ' : ''}${message}`;
      });
      throw new Error(
        `
Invalid options in ${slash(path.relative(cwd, data))}

${errors?.join('\n')}
`.trim(),
      );
    }
  }

  return data;
}
