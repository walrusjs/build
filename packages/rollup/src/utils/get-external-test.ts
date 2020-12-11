import escapeStringRegexp from 'escape-string-regexp';

export default function(external: string[]) {
  const escapeStringExternals = (ext: string | RegExp) =>
    ext instanceof RegExp ? ext.source : escapeStringRegexp(ext);

  const externalPredicate = new RegExp(
    `^(${external.map(escapeStringExternals).join('|')})($|/)`,
  );

  return external.length === 0
    ? (id: string) => false
    : (id: string) => externalPredicate.test(id);
}
