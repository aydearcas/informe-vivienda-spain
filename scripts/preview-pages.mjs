import { spawn } from 'node:child_process';
const server = spawn(process.execPath, ['node_modules/astro/bin/astro.mjs', 'preview', '--host', '127.0.0.1', '--port', '4321'], {
  stdio: 'inherit',
  env: { ...process.env, SITE_URL: 'https://aydearcas.github.io', BASE_PATH: '/informe-vivienda-spain' },
});
server.on('exit', (code) => { process.exitCode = code || 0; });
