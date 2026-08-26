export const appName = 'Schema Pack';
export const docsRoute = '/docs';

export const gitConfig = {
  user: 'pawnary',
  repo: 'schema-pack',
  branch: 'master',
};

export function getPageImagePath(slugs: string[], locale?: string) {
  return '/' + [locale, ...slugs, 'image.webp'].filter(Boolean).join('/');
}
