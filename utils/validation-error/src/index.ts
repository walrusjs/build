import log from 'npmlog';

class ValidationError extends Error {
  public prefix: string;

  constructor(prefix: string, message: string, ...rest: any[]) {
    super(message);
    this.name = 'ValidationError';
    this.prefix = prefix;
    log.resume();
    log.error(prefix, message, ...rest);
  }
}

export default ValidationError;
