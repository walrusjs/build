import { isDir, isFile, removeScope } from '@/utils';
import { resolve } from 'path';

describe('isFile', () => {
  it('文件存在', () => {
    expect.assertions(1);
    return isFile(resolve(__dirname, '../../src/index.ts')).then(result => {
      return expect(result).toEqual(true);
    });
  });

  it('文件不存在', () => {
    expect.assertions(1);
    return isFile(resolve(__dirname, '../../src/main.ts')).then(result => {
      return expect(result).toEqual(false);
    });
  });

  it('路径是目录', () => {
    expect.assertions(1);
    return isFile(resolve(__dirname, '../../src')).then(result => {
      return expect(result).toEqual(false);
    });
  });
});

describe('isDir', () => {
  it('文件夹存在', () => {
    expect.assertions(1);
    return isDir(resolve(__dirname, '../../src')).then(result => {
      return expect(result).toEqual(true);
    });
  });

  it('文件夹不存在', () => {
    expect.assertions(1);
    return isDir(resolve(__dirname, '../../src1')).then(result => {
      return expect(result).toEqual(false);
    });
  });

  it('路径是文件', () => {
    expect.assertions(1);
    return isDir(resolve(__dirname, '../../src/index.ts')).then(result => {
      return expect(result).toEqual(false);
    });
  });
});

describe('removeScope', () => {

  it('空字符串', () => {
    expect(removeScope('')).toEqual('');
  });

  it('带有组织的库名称', () => {
    expect(removeScope('@pansy/build')).toEqual('build');
  });

  it('只存在组织前缀', () => {
    expect(removeScope('@pansy')).toEqual('@pansy');
  });
})