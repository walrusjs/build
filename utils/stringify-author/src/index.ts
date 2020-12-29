export type AuthorKey = 'name' | 'email' | 'url';

export type Author = Partial<Record<AuthorKey, string>>;

function stripSlash(str: string): string {
  return str.replace(/\/$/, '');
}

const stringifyAuthor = (author: Author) => {
  if (typeof author !== 'object') {
    throw new Error('expected an author to be an object');
  }

  const templates: Record<AuthorKey, [string, string]>= {
    name: ['', ''],
    email: ['<', '>'],
    url: ['(', ')']
  };

  let str = '';

  if (author.url) author.url = stripSlash(author.url);

  for (let key in templates) {
    if (author[key as AuthorKey]) {
      const temp = templates[key as AuthorKey];
      str += temp[0] + author[key as AuthorKey] + temp[1] + ' ';
    }
  }

  return str.trim();
}

export default stringifyAuthor;
