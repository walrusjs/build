import AJV from 'ajv';
import chalk from 'chalk';
import { configLoader } from './';

const slash = require('slash');

export function getUserConfig(opts: {
  cwd: string,
  files: string[],
  schema?: object,
  packageKey: string
}) {
  const { cwd, files, schema, packageKey } = opts;
  const {
    data = {},
    path: configFilePath
  } = configLoader.loadSync({
    files,
    cwd,
    packageKey
  });

  if (configFilePath && schema) {
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
