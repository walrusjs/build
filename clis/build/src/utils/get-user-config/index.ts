import AJV from 'ajv';
import chalk from 'chalk';
import { DEFAULT_CONFIG_FILE } from '../../config';
import { configLoader } from '@walrus/build-utils';
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
      }) ?? [];
      console.log(chalk.red(
        `
Invalid options in ${slash(configFilePath)}

${errors.join('\n')}
`.trim(),
      ));
      process.exit(1);
    }
  }

  return data;
}
