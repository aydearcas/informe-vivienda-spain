# Vivienda en España · edición web

Web editorial del informe revisado y ampliado. Proyecto autónomo con Astro, preparado para el repositorio **aydearcas/informe-vivienda-spain** y GitHub Pages.

## Editar el informe

- `content/informe.md` es la fuente principal del texto. Es una copia íntegra del Markdown revisado y ampliado; el original del proyecto queda conservado.
- `content/visuales.json` contiene títulos y dimensiones de las figuras, y títulos de las tablas. Se mantiene la numeración del PDF. Si añades o quitas una figura o tabla, actualiza también esta lista.
- `public/graficos/` contiene los doce gráficos originales, sin modificar sus datos ni colores.
- `public/descargas/informe.pdf` contiene el PDF de 51 páginas. Sustitúyelo al generar una nueva edición: la web no recompone el PDF automáticamente.
- La descarga Markdown se actualiza automáticamente durante la compilación. El índice de capítulos se genera a partir de los encabezados. El índice manual del Markdown se sustituye en la web por navegación automática.

El diseño no necesita servicios externos, cookies, cuentas de visitantes ni fuentes remotas. Las fuentes tipográficas usan las disponibles en el dispositivo.

## Vista previa local

Requisitos: Node.js 22.12 o posterior y pnpm 10 o posterior.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Para comprobar la versión que se publicará:

```bash
pnpm build
pnpm verify
pnpm preview
```

`verify` comprueba la conservación de párrafos, listas, tablas, figuras y enlaces, las anclas internas y los archivos descargables.

## Publicar en GitHub Pages

1. Usar el repositorio independiente `aydearcas/informe-vivienda-spain`, conservando su licencia GPL-3.0 y su historial.
2. Subir **el contenido de esta carpeta**, incluyendo `.github/workflows/deploy.yml`, `pnpm-lock.yaml` y `pnpm-workspace.yaml`. No subir `node_modules/`, `dist/` ni el resto de AdArK.
3. En **Settings → Pages → Build and deployment**, seleccionar **GitHub Actions**.
4. Ejecutar **Actions → Publicar informe en GitHub Pages → Run workflow**, o enviar un cambio a `main`.
5. La dirección prevista es **https://aydearcas.github.io/informe-vivienda-spain/**.

El workflow obtiene automáticamente la ruta del repositorio mediante `configure-pages`; no hace falta cambiar enlaces a mano. El despliegue se ejecuta únicamente en `main` o por lanzamiento manual. Un repositorio vacío puede necesitar que se active Pages antes de que `configure-pages` funcione.

Guía oficial de [despliegue de Astro en GitHub Pages](https://docs.astro.build/en/guides/deploy/github/).

Para simular la ruta de GitHub Pages en PowerShell:

```powershell
$env:SITE_URL = 'https://aydearcas.github.io'
$env:BASE_PATH = '/informe-vivienda-spain'
pnpm build
pnpm verify
pnpm preview
```

## Qué incluye

Portada terracota, texto sobre fondo marfil, índice lateral con apartado activo, menú móvil, numeración e índices de figuras y tablas, gráficos ampliables, tablas con desplazamiento horizontal, enlaces a cada apartado, progreso de lectura, impresión y descarga del PDF y del Markdown.

Se conserva la fecha de corte y el contenido del informe. La creación de la web no constituye una actualización ni una nueva verificación factual de sus fuentes.
