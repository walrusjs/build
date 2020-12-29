import stringify from '../src';

describe('author',  () => {
  it('should stringify name:', function () {
    const author = { name: 'Jon Schlinkert' };
    expect(stringify(author)).toEqual('Jon Schlinkert');
  });

  it('should stringify email:', function () {
    const author = { email: 'jon.schlinkert@sellside.com' };
    expect(stringify(author)).toEqual('<jon.schlinkert@sellside.com>');
  });

  it('should stringify url:', function () {
    const author = { url: 'https://github.com/jonschlinkert' };
    expect(stringify(author)).toEqual('(https://github.com/jonschlinkert)');
  });

  it('should strip trailing slashes from URL:', function () {
    const author = { url: 'https://github.com/jonschlinkert/' };
    expect(stringify(author)).toEqual('(https://github.com/jonschlinkert)');
  });

  it('should stringify name and url:', function () {
    const author = { name: 'Jon Schlinkert', url: 'https://github.com/jonschlinkert' };
    expect(stringify(author)).toEqual('Jon Schlinkert (https://github.com/jonschlinkert)');
  });

  it('should stringify name and email:', function () {
    const author = { name: 'Jon Schlinkert', email: 'jon.schlinkert@sellside.com' };
    expect(stringify(author)).toEqual('Jon Schlinkert <jon.schlinkert@sellside.com>');
  });

  it('should stringify email and url:', function () {
    const author = { email: 'jon.schlinkert@sellside.com', url: 'https://github.com/jonschlinkert' };
    expect(stringify(author)).toEqual('<jon.schlinkert@sellside.com> (https://github.com/jonschlinkert)');
  });

  it('should stringify name, email and url:', function () {
    const author = {name: 'Jon Schlinkert', email: 'jon.schlinkert@sellside.com', url: 'https://github.com/jonschlinkert'};
    expect(stringify(author)).toEqual('Jon Schlinkert <jon.schlinkert@sellside.com> (https://github.com/jonschlinkert)');
  });
});
