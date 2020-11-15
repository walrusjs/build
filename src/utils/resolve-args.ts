import { Config, Target, Format } from '@/types';
import { isString } from 'lodash';

export interface Args {
  cwd?: string;
  files?: string;
  formats?: string;
  target?: Target;
  entry?: Config['entry'];
  entries?: string[];
  tsconfig?: Config['tsconfig'];
}

function resolveArgs(args: Args): Config {
  const config: Config = {
    cwd: args.cwd,
    target: args.target,
    tsconfig: args.tsconfig,
  };

  if (args.formats && isString(args.formats)) {
    config.formats = args.formats.split(',') as Format[];
  }

  if (Array.isArray(args.entries) && args.entries.length) {
    config.entry = args.entries;
  }

  return config;
}

export default resolveArgs;
