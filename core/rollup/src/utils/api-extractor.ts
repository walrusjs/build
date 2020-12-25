import path from 'path';
import fs from 'fs-extra';
import globby from 'globby';
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import { NormalizedConfig } from '@walrus/build-types';

export default async function({
  cwd,
  pkg,
  typeExtractor,
  tsconfig,
  output
}: NormalizedConfig) {
  if (typeExtractor === false) return;
  const outDir = path.dirname(output);
  const { files = [], ignore = [], includedPackages = [] } = typeExtractor;

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
        bundledPackages: includedPackages,
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
      packageJson: pkg as any,
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
