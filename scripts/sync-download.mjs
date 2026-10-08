import { copyFile, mkdir } from 'node:fs/promises';
await mkdir(new URL('../public/descargas/', import.meta.url), { recursive: true });
await copyFile(new URL('../content/informe.md', import.meta.url), new URL('../public/descargas/informe.md', import.meta.url));
