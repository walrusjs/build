import stringifyAuthor from '@walrus/stringify-author';
import { Banner } from '@walrus/build-types';
import { PackageJson } from '@pansy/types';

type PKG = PackageJson & { [key: string]: any};

const getBanner = (
  banner?: Banner,
  pkg?: PKG
): string => {
  if (!banner || typeof banner === 'string') {
    return banner || ''
  }

  banner = { ...pkg, ...(banner === true ? {} : banner) }

  const author =
    typeof banner.author === 'string'
      ? banner.author
      : typeof banner.author === 'object'
      ? stringifyAuthor(banner.author)
      : ''

  const license = banner.license || ''

  return (
    '/*!\n' +
    ` * ${banner.name} v${banner.version}\n` +
    ` * (c) ${author || ''}\n` +
    (license && ` * Released under the ${license} License.\n`) +
    ' */'
  )
}

export default getBanner;
