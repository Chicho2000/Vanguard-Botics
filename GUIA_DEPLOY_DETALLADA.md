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

### Paso 1: Compilación en Entorno Local (Tu Computadora)
Antes de subir cualquier archivo, es indispensable compilar la aplicación para generar los recursos estáticos de producción.

1. Abre una terminal local en la carpeta del frontend (`Proyecto`):
   ```bash
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
Transfiere los binarios compilados y las configuraciones actualizadas al servidor Debian.

```bash
# 1. Subir Frontend compilado (Vite)
scp -P 22002 -r Proyecto/dist/* tres@200.3.127.46:/home/tres/public_html/

# 2. Subir Backend compilado (carpeta dist)
scp -P 22002 -r dist/* tres@200.3.127.46:/home/tres/servicios/dist/

# 3. Subir configuraciones críticas del Backend
scp -P 22002 package.json tres@200.3.127.46:/home/tres/servicios/
scp -P 22002 prisma/schema.prisma tres@200.3.127.46:/home/tres/servicios/prisma/
```

---

### Paso 3: Configuración y Reinicio en el Servidor (SSH)
Conéctate por terminal remota para preparar el entorno de producción.

1. Accede por SSH:
   ```bash
   ssh -p 22002 tres@200.3.127.46
   ```
2. Navega e instala las dependencias de NodeJS:
   ```bash
   cd ~/servicios
   npm install
   ```
3. Regenera el motor de base de datos local del servidor:
   ```bash
   npx prisma generate
   ```
4. Reinicia la aplicación usando PM2 para aplicar los cambios de código:
   ```bash
   pm2 restart servicios
   ```
5. Verifica los logs del servidor para confirmar que arrancó correctamente:
   ```bash
   pm2 logs servicios --lines 20
   ```

---

## 🚨 Posibles Errores y Cómo Solucionarlos

### 1. Error `ENOTEMPTY: directory not empty` al ejecutar `npm install`
* **Causa:** Ocurre porque `npm` intenta mover o reescribir dependencias dentro de `node_modules` que están bloqueadas por procesos activos, enlaces simbólicos rotos o directorios corruptos.
* **Solución:** Debes eliminar la carpeta de módulos antiguos y el archivo de bloqueo para limpiar la instalación:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

---

### 2. Error `PrismaClientConstructorValidationError` o Adaptador Incompatible
* **Mensaje típico:** *"adapter property can only be provided to PrismaClient constructor when driverAdapters preview feature is enabled"*
* **Causa:** Subiste cambios al servidor que requieren el adaptador de base de datos PostgreSQL (`@prisma/adapter-pg`), pero el motor de Prisma generado en el servidor Debian es de una versión anterior o no está sincronizado con el archivo `schema.prisma`.
* **Solución:** Regenera el cliente local de Prisma en el servidor para reconstruir las clases necesarias:
  ```bash
  npx prisma generate
  ```
  *(Asegúrate también de haber subido el archivo `schema.prisma` correcto al servidor mediante SCP).*

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
