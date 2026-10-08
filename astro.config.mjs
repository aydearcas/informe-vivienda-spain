import { defineConfig } from 'astro/config';

// configure-pages provides these values in the workflow. Local builds use /.
export default defineConfig({
  ...(process.env.SITE_URL ? { site: process.env.SITE_URL } : {}),
  base: process.env.BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'always',
});
