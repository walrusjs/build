import { existsSync } from 'fs-extra';
import path from 'path';

/**
 * 按顺序获取文件
 * @param cwd 目录
 * @param files 获取的文件顺序
 * @param returnRelative
 */
export function getExistFile({
  cwd,
  files,
  returnRelative
}: {
  cwd: string;
  files: string[];
  returnRelative?: boolean;
}) {
  for (const file of files) {
    const absFilePath = path.join(cwd, file);
    if (existsSync(absFilePath)) {
      return returnRelative ? file : absFilePath;
    }
  }
}
