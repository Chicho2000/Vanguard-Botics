# Frontend — Vanguard Botics

Aplicación React + TypeScript + Vite del sistema de gestión de cocheras. El backend se encuentra en la raíz del repositorio.

## Desarrollo local

Desde esta carpeta:

```bash
npm install
npm run dev
```

El frontend queda disponible en `http://localhost:5173` y el proxy de Vite redirige `/~tres/api` al backend local en el puerto `3000`.

Para levantar frontend y backend juntos desde la raíz del repositorio, usar:

```bash
npm run dev
```

## Variables de entorno

Crear uno de estos archivos locales, que no se suben a Git:

- `.env.local` para desarrollo.
- `.env.production.local` para el build de producción.

La clave pública de Cloudflare Turnstile se declara así:

```env
VITE_TURNSTILE_SITE_KEY="clave-publica-del-widget"
```

Después de cambiar una variable `VITE_`, reiniciar el servidor de desarrollo. La clave secreta de Turnstile no pertenece a esta carpeta: vive exclusivamente en el `.env` del backend.

## Comandos

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia Vite para desarrollo. |
| `npm run build` | Verifica TypeScript y genera `dist/`. |
| `npm run lint` | Ejecuta ESLint. |
| `npm run preview` | Sirve localmente el build generado. |
| `npm run ui:add -- <componente>` | Agrega un componente de Shadcn. |

El deploy, la API y la configuración de servidor se documentan en el [README principal](../README.md) y en [GUIA_DEPLOY_DETALLADA.md](../GUIA_DEPLOY_DETALLADA.md).
