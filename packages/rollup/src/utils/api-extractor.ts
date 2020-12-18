import path from 'path';
import fs from 'fs-extra';
import globby from 'globby';
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import { NormalizedConfig } from '../types';

export default async function({
  cwd,
  pkg,
  dts,
  tsconfig,
  output
}: NormalizedConfig) {
  if (dts === false) return;
  const outDir = path.dirname(output);
  const { files = [], ignore = [], includedPackages = [] } = dts;

  const dtsFiles = await globby(files, {
    cwd: outDir,
    absolute: true,
    ignore,
  });

  dtsFiles.forEach(dtsFile => {
    // 处理类型文件
    const config = ExtractorConfig.prepare({
      configObjectFullPath: path.join(cwd, './api-extractor.json'),
      configObject: {
        projectFolder: cwd,
        mainEntryPointFilePath: dtsFile,
        bundledPackages: [],
        apiReport: { enabled: false, reportFileName: 'report.api.md' },
        dtsRollup: { enabled: true, untrimmedFilePath: dtsFile },
        tsdocMetadata: { enabled: false },
        docModel: { enabled: false },
        compiler: {
          tsconfigFilePath: tsconfig,
        },
        newlineKind: 'lf',
      },
      packageJsonFullPath: path.join(cwd, './package.json'),
      packageJson: pkg,
    });

    Extractor.invoke(config, {
      localBuild: true,
    });
  });

    const scrappedDtsFiles = await globby('**/*.d.ts', {
      cwd: outDir,
      absolute: true,
      ignore: [...dtsFiles, ...ignore],
    });

    await Promise.all(scrappedDtsFiles.map(file => fs.remove(file)));
}
