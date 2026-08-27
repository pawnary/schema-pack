import { gitConfig } from './lib/shared.ts';

export const isProd = process.env.NODE_ENV === 'production';

export const basename = isProd ? `/${gitConfig.repo}/` : '/';
export const assetsDir = isProd ? `${gitConfig.repo}/assets` : 'assets';
