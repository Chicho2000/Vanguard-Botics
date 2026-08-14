# 🚀 Guía de Despliegue Detallada — Vanguard Botics

Esta guía describe el flujo paso a paso para desplegar la aplicación (Frontend y Backend) en el servidor Debian, junto con los posibles errores que pueden surgir en cada fase y cómo solucionarlos.

---

## 🛠️ Parámetros del Servidor de Producción

* **Usuario:** `tres`
* **IP del Servidor:** `200.3.127.46`
* **Puerto SSH/SCP:** `22002`
* **Directorio Frontend:** `/home/tres/public_html`
* **Directorio Backend:** `/home/tres/servicios`

---

## 📅 Paso a Paso del Despliegue

> El despliegue habitual del proyecto se hace sobrescribiendo los archivos compilados. El código y su historial quedan resguardados en el repositorio local/GitHub; no se copia ni se sube el archivo `.env` del servidor.

### Paso 0: Verificaciones previas

1. Confirma que el repositorio local está actualizado y sin cambios pendientes:
   ```bash
   git status
   git pull origin main
   ```
2. Conéctate al servidor:
   ```bash
   ssh -p 22002 tres@200.3.127.46
   ```
3. Comprueba el proceso y conserva los valores actuales de puerto y proxy:
   ```bash
   pm2 status
   pm2 describe servicios
   ```
4. Sal del servidor para volver a la terminal local:
   ```bash
   exit
   ```

### Paso 1: Compilación en Entorno Local (Tu Computadora)
Antes de subir cualquier archivo, es indispensable compilar la aplicación para generar los recursos estáticos de producción.

1. Abre una terminal local en la carpeta del frontend (`Proyecto`):
   ```bash
   # Antes de compilar, crear Proyecto/.env.production.local (no se sube):
   # VITE_TURNSTILE_SITE_KEY="clave_publica_del_widget"
   cd Proyecto
   npm run build
   cd ..
   ```
2. Compila el backend (TypeScript a JavaScript) en la raíz:
   ```bash
   npm run build
   ```

---

### Paso 2: Transferencia de Archivos (SCP)
Transfiere los binarios compilados y las configuraciones actualizadas al servidor Debian. Este flujo sobrescribe los archivos generados; no subas ni reemplaces el `.env` remoto.

```bash
# 1. Subir Frontend compilado (Vite)
scp -P 22002 -r Proyecto/dist/* tres@200.3.127.46:/home/tres/public_html/

# 2. Subir Backend compilado (carpeta dist)
scp -P 22002 -r dist/* tres@200.3.127.46:/home/tres/servicios/dist/

# 3. Subir configuraciones críticas del Backend
scp -P 22002 package.json tres@200.3.127.46:/home/tres/servicios/
scp -P 22002 package-lock.json tres@200.3.127.46:/home/tres/servicios/
scp -P 22002 -r prisma/schema tres@200.3.127.46:/home/tres/servicios/prisma/
scp -P 22002 -r prisma/migrations tres@200.3.127.46:/home/tres/servicios/prisma/
scp -P 22002 prisma.config.ts tres@200.3.127.46:/home/tres/servicios/
```

---

### Paso 3: Configuración y Reinicio en el Servidor (SSH)
Conéctate por terminal remota para preparar el entorno de producción.

1. Accede por SSH:
   ```bash
   ssh -p 22002 tres@200.3.127.46
   ```
2. Si cambiaron `package.json` o `package-lock.json`, instala las dependencias de NodeJS:
   ```bash
   cd ~/servicios
   npm ci
   ```
   Si sólo se actualizó `dist/` o Prisma, este paso no hace falta. Los avisos de `npm audit` no significan que la instalación haya fallado. No ejecutes `npm audit fix` ni `npm audit fix --force`.
3. Regenera el motor de base de datos local del servidor:
   ```bash
   npx prisma generate
   ```
   No ejecutes `prisma migrate reset`. Esta instalación utiliza una base existente. La migración debe revisarse antes de aplicar `npx prisma migrate deploy`, porque la relación de cocheras puede existir ya en Supabase.
4. Reinicia la aplicación usando PM2 para aplicar los cambios de código:
   ```bash
   # Antes de reiniciar, agregar al .env existente (no subirlo):
   # CAPTCHA_REQUIRED=true
   # TURNSTILE_SECRET_KEY="clave_secreta_del_widget"
   # SESSION_DURATION_MINUTES=120
   # GUEST_SESSION_DURATION_MINUTES=240
   pm2 restart servicios --update-env
   ```
5. Verifica los logs del servidor para confirmar que arrancó correctamente:
   ```bash
   pm2 logs servicios --err --lines 50 --nostream
   ```

---

### Paso 4: Verificación final

Realiza estas comprobaciones en orden:

1. Abre `http://200.3.127.46:8002/~tres/?v=N`, cambiando `N` por un número nuevo.
2. Abre `http://200.3.127.46:8002/~tres/api/parking-spots/available`. Debe responder JSON con `success: true` y una lista `data`.
3. Inicia sesión como administrador y abre Dashboard, Mapa y Usuarios.
4. Comprueba que el Dashboard no quede negro y que los invitados activos tengan el tag `INVITADO`.
5. Con un cliente, elige un lugar y confirma que quede guardado.
6. Con un invitado, registra un ingreso, sal del panel, vuelve con la misma patente y registra la salida.
7. Desde el admin, cambia un vehículo a un lugar libre y luego intercámbialo con uno ocupado.
8. Vuelve a revisar:
   ```bash
   ssh -p 22002 tres@200.3.127.46
   pm2 status
   pm2 logs servicios --err --lines 50 --nostream
   ```

El despliegue se considera correcto únicamente si la API responde JSON, las tres vistas por rol funcionan y los logs no muestran errores nuevos.

---

## 🚨 Posibles Errores y Cómo Solucionarlos

### 1. Error `ENOTEMPTY: directory not empty` al ejecutar `npm install`
* **Causa:** Ocurre porque `npm` intenta mover o reescribir dependencias dentro de `node_modules` que están bloqueadas por procesos activos, enlaces simbólicos rotos o directorios corruptos.
* **Solución:** no borres `package-lock.json`, porque define las versiones reproducibles del proyecto. Detén primero el proceso y reconstruye `node_modules` desde el lockfile:
  ```bash
  pm2 stop servicios
  npm ci
  pm2 restart servicios --update-env
  ```
  Si el error continúa, guarda el log y revisa permisos/archivos bloqueados antes de borrar cualquier directorio.

---

### 2. Error `PrismaClientConstructorValidationError` o Adaptador Incompatible
* **Mensaje típico:** *"adapter property can only be provided to PrismaClient constructor when driverAdapters preview feature is enabled"*
* **Causa:** Subiste cambios al servidor que requieren el adaptador de base de datos PostgreSQL (`@prisma/adapter-pg`), pero el motor de Prisma generado en el servidor Debian es de una versión anterior o no está sincronizado con el esquema modular de Prisma.
* **Solución:** Regenera el cliente local de Prisma en el servidor para reconstruir las clases necesarias:
  ```bash
  npx prisma generate
  ```
  *(Asegúrate también de haber subido la carpeta completa `prisma/schema/` y `prisma.config.ts` mediante SCP).*

---

### 3. Error `502 Bad Gateway` o la API no responde
* **Causa:** El proxy inverso de Apache no puede redirigir las peticiones porque el servidor backend de NodeJS se cayó al iniciar (por error de base de datos o sintaxis) o no está escuchando en el puerto configurado (ej: `3003`).
* **Solución:**
  1. Revisa el estado del backend con:
     ```bash
     pm2 status
     ```
  2. Si está en estado `errored` o con bucle de reinicios (`restarting`), inspecciona los logs de error detallados para ver la traza exacta:
     ```bash
     pm2 logs servicios --err --lines 50
     ```
  3. Resuelve el error de configuración indicado en los logs y reinicia con `pm2 restart servicios`.

---

### 4. Los cambios no se ven reflejados en el navegador (Error de Caché)
* **Causa:** El proxy intermedio de red o el servidor Apache cachea permanentemente el archivo principal `index.html` del frontend para acelerar la carga, ignorando los nuevos archivos subidos.
* **Solución:**
  - Evita la caché añadiendo un parámetro de control a la URL:
    * Accede con: `http://200.3.127.46:8002/~tres/?v=N` (incrementa `N` después de cada deploy).
  - Haz una recarga forzada en el navegador presionando `Ctrl + F5` (Windows) o `Cmd + Shift + R` (Mac).

---

### 5. El admin devuelve 500 y el selector de lugares está vacío

* **Causa más probable:** se publicó el frontend nuevo, pero el backend continúa con una versión anterior. La ruta pública `/parking-spots/available` y el esquema Prisma modular deben desplegarse al mismo tiempo.
* **Comprobación:** abre `/~tres/api/parking-spots/available`; debe responder JSON con una lista de lugares, nunca HTML ni 404.
* **Solución:** vuelve a subir `dist/`, `package.json`, `package-lock.json`, `prisma.config.ts` y la carpeta completa `prisma/schema/`. Luego ejecuta en el servidor:
  ```bash
  cd ~/servicios
  npm install
  npx prisma generate
  pm2 restart servicios --update-env
  pm2 logs servicios --err --lines 50 --nostream
  ```

---

### 6. PM2 está `online`, pero `curl 127.0.0.1:3003` rechaza la conexión

* **Causa posible:** PM2 acababa de reiniciar o el proceso falló durante el arranque. El estado `online` por sí solo no confirma que Express ya esté escuchando.
* **Comprobación y solución:** espera unos segundos y ejecuta, en este orden:
  ```bash
  pm2 status
  pm2 logs servicios --err --lines 50 --nostream
  ss -ltnp | grep node
  curl -i http://127.0.0.1:3003/parking-spots/available
  ```
  Si falta `dist/index.js` o se informa un módulo no encontrado, vuelve a subir el contenido compilado con `scp -P 22002 -r dist/* tres@200.3.127.46:/home/tres/servicios/dist/` y reinicia PM2. No confundas errores viejos del log con errores emitidos después del último reinicio.

---

### 7. Prisma informa `Unknown argument assignedUserId` u otro campo inexistente

* **Causa:** el backend compilado usa un esquema más nuevo que el cliente Prisma generado en el servidor.
* **Solución:** sube en conjunto `prisma/schema/`, `prisma/migrations/` y `prisma.config.ts`; luego ejecuta:
  ```bash
  cd ~/servicios
  npx prisma generate
  pm2 restart servicios --update-env
  ```
  Usa `npx prisma migrate status` sólo para inspeccionar el estado. En una base compartida o existente no ejecutes por impulso `prisma migrate deploy`, `prisma db push` ni `prisma migrate reset`: una migración pendiente requiere revisión previa porque puede tocar datos operativos ya creados.

---

### 8. La página queda en blanco y la consola muestra `403 (Forbidden)` para `assets/*.js` o `assets/*.css`

* **Causa:** Apache puede leer `index.html`, pero no tiene permiso de atravesar la carpeta `assets` o leer los archivos compilados.
* **Comprobación:** en el servidor, los nombres referidos por `index.html` deben existir dentro de `public_html/assets`:
  ```bash
  cd ~/public_html
  grep -oE '/~tres/assets/[^" ]+' index.html
  find assets -maxdepth 2 -type f -printf '%P\n'
  ```
* **Solución:** corrige únicamente los permisos de lectura del contenido público:
  ```bash
  cd ~/public_html
  chmod 755 assets
  find assets -type d -exec chmod 755 {} \;
  find assets -type f -exec chmod 644 {} \;
  ```
  Después recarga con `Ctrl + F5` o abre `/?v=N` con un valor nuevo.

---

### 9. Turnstile se ve localmente pero no valida, o no aparece después de cambiar de pestaña

* **Causa posible:** se usaron claves de widgets distintos, falta una URL permitida en Cloudflare, o se compiló el frontend sin la clave pública.
* **Solución:** en `Proyecto/.env.local` (desarrollo) o `Proyecto/.env.production.local` (compilación) configura sólo `VITE_TURNSTILE_SITE_KEY`. En el `.env` del backend configura `CAPTCHA_REQUIRED=true` y `TURNSTILE_SECRET_KEY`. Las dos claves deben pertenecer al mismo widget y la URL/host de la aplicación debe estar autorizado en Cloudflare. Vuelve a compilar el frontend tras cambiar una variable `VITE_` y reinicia el backend tras cambiar su `.env`.
