export const appName = 'Schema Pack';
export const docsRoute = '/docs';

export const gitConfig = {
  branch: 'master',
  repo: 'schema-pack',
  user: 'pawnary',
};

export function getPageImagePath(slugs: string[], locale?: string): string {
  return `/${[locale, ...slugs, 'image.webp'].filter(Boolean).join('/')}`;
}
