# Errores conocidos y soluciones — Vanguard Botics

## Desarrollo y cambios de código

### Error interno al iniciar sesión localmente

- **Síntoma:** `/auth/login` devuelve HTTP 500 aunque las credenciales sean correctas.
- **Causa encontrada:** el proceso iniciado por un entorno restringido o un reinicio de `tsx watch` perdió acceso de red a Supabase (`Prisma` informó `EACCES`).
- **Solución:** iniciar el backend desde una terminal normal con `npm run dev:backend`. El script quedó sin `watch` para evitar que un proceso hijo reiniciado pierda permisos. Confirmar que una contraseña incorrecta devuelve 401 y no 500.
- **No confundir:** los avisos de vulnerabilidades de `npm install` no causan este error.

### PowerShell bloquea `npm.ps1`

- **Síntoma:** PowerShell informa que la ejecución de scripts está deshabilitada.
- **Solución:** usar `npm.cmd` en esa terminal o ejecutar los comandos desde CMD. No hace falta cambiar dependencias.

### Dashboard administrativo completamente negro

- **Causa encontrada:** el resumen de invitados enviaba `assignedSpot` como objeto Prisma, pero React esperaba una etiqueta de texto.
- **Solución aplicada:** `src/services/stats.service.ts` devuelve `session.spot.label`.
- **Prevención:** los DTO del backend deben coincidir exactamente con las interfaces del frontend; nunca renderizar objetos completos como hijos de React.

### Invitado mostrado como reserva o ausente del mapa

- **Causa:** crear un usuario `INVITADO` con cochera solo asignaba el lugar, pero no creaba una sesión activa.
- **Solución aplicada:** los invitados creados por el admin inician una `ParkingSession`; los invitados por patente permanecen activos hasta registrar su salida. `isGuest` contempla tanto vehículos sin usuario como usuarios con rol `INVITADO`.

### Invitado no puede volver para registrar su salida

- **Causa:** el formulario exigía siempre marca y lugar, incluso cuando la patente ya tenía una sesión activa.
- **Solución aplicada:** la patente sola recupera la sesión activa; marca y lugar solo son necesarios para un ingreso nuevo.

### Selector administrativo de lugares confuso

- **Solución aplicada:** clic en un lugar ocupado o reservado, elección de destino y traslado. Si el destino está ocupado o reservado, el backend intercambia sesiones y asignaciones dentro de una transacción.
- **Precaución:** `assignedUserId` es único. Antes de intercambiar asignaciones se deben limpiar temporalmente ambas y luego guardar los valores invertidos.

### Lugar ocupado por un invitado huérfano

- La sesión invitada huérfana de B2 se eliminó mediante una limpieza puntual y se reparó el estado de ocupación.
- Los scripts temporales usados para esa tarea fueron eliminados del repositorio. Si vuelve a ocurrir, diagnosticar primero la sesión específica y no realizar una limpieza general ni borrar vehículos registrados.

### Validaciones demasiado permisivas

- Teléfono argentino: aceptar código de país/prefijos habituales, pero validar finalmente 10 dígitos nacionales con código de área.
- Patentes y marcas: usar las validaciones compartidas de `src/validation/schemas.ts` y `Proyecto/src/lib/validation.ts`.
- Marca: selector conocido más opción `Otro`; no volver a exigir modelo.

### Suscripciones y recaudación duplicadas

- **Causa:** cada cambio de plan podía interpretarse como ingreso adicional acumulado.
- **Solución aplicada:** mantener una sola suscripción activa y calcular el Dashboard desde el estado/pago vigente correspondiente, no sumando cada cambio histórico como una venta nueva.

## Base de datos y Prisma

- El esquema está dividido por tabla en `prisma/schema/models/`.
- `prisma.config.ts` apunta a `prisma/schema` y usa `DIRECT_URL` para comandos de Prisma.
- El runtime usa `DATABASE_URL` mediante `@prisma/adapter-pg`.
- Después de subir el esquema, ejecutar `npx prisma generate` en el servidor.
- No ejecutar automáticamente `prisma db push`, `prisma migrate reset` ni limpiezas en producción: pueden alterar o borrar datos.
- La base Supabase ya recibió durante el desarrollo la relación `assignedUserId`. Antes de ejecutar migraciones en otro entorno, comprobar su estado para evitar aplicar dos veces el mismo cambio.

### Cliente Prisma desactualizado en el servidor

- **Síntoma:** una ruta compilada nueva devuelve 500 con `Unknown argument assignedUserId` (u otro campo del esquema).
- **Causa:** el servidor conserva el cliente Prisma generado con el esquema anterior.
- **Regla:** cuando cambie el backend o el esquema, desplegar también `prisma/schema/`, `prisma/migrations/` y `prisma.config.ts`; ejecutar `npx prisma generate` antes de reiniciar PM2. Consultar primero `npx prisma migrate status`; no aplicar, empujar ni resetear migraciones de una base existente sin revisar su impacto.

## Despliegue

### Frontend nuevo con backend viejo

- **Síntomas:** login admin 500, dropdown de cocheras vacío, rutas con 404 o HTML en vez de JSON.
- **Solución:** publicar frontend, backend, `package.json`, lockfile, `prisma.config.ts` y la carpeta completa `prisma/schema/` en la misma intervención; luego instalar, generar Prisma y reiniciar PM2.

### Prototipo anterior deja archivos obsoletos

- Hacer copia de seguridad antes de reemplazar.
- Limpiar el contenido visible de `public_html`, preservando `.htaccess` y cualquier configuración del hosting.
- Reemplazar por completo la carpeta backend `dist`; no copiar encima de una versión antigua porque pueden quedar módulos compilados que ya no existen.

### HTTP 502 o API caída

- Revisar `pm2 status` y `pm2 logs servicios --err`.
- Confirmar que `.env` existe solo en el servidor y contiene `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `FRONTEND_URL` y `PORT` correctos.
- El puerto debe coincidir con el proxy de Apache existente.
- Reiniciar con `pm2 restart servicios --update-env`.

### Página o archivos antiguos después del deploy

- Los assets Vite tienen hash, pero `index.html` puede quedar cacheado.
- Usar recarga forzada y la URL `http://200.3.127.46:8002/~tres/?v=N` incrementando `N`.
- Confirmar que `Proyecto/vite.config.ts` conserva `base: '/~tres/'`.

### Pantalla blanca con respuestas 403 para assets Vite

- **Síntoma:** `index.html` abre, pero los archivos `assets/*.js` y `assets/*.css` devuelven `403 (Forbidden)` en la consola del navegador.
- **Causa:** la carpeta `~/public_html/assets` quedó con permisos que Apache no puede atravesar o leer.
- **Solución comprobada:** validar que los hashes de `index.html` existan en `assets/`, dejar directorios con `755` y archivos con `644`, y hacer una recarga forzada. No es un problema de React ni de la compilación.

### Turnstile y variables de entorno

- La clave pública `VITE_TURNSTILE_SITE_KEY` pertenece al frontend y se incorpora al compilar; la clave secreta `TURNSTILE_SECRET_KEY` sólo existe en el `.env` del backend.
- Las dos claves deben pertenecer al mismo widget y el host usado debe estar habilitado en Cloudflare. Tras cambiar la variable pública hay que reconstruir/subir el frontend; tras cambiar la secreta, reiniciar PM2 con `--update-env`.

### Comprobaciones mínimas posteriores

1. La portada carga bajo `/~tres/`.
2. `/~tres/api/parking-spots/available` devuelve JSON.
3. Admin inicia sesión y carga Dashboard, Mapa y Usuarios.
4. Cliente puede elegir/guardar cochera.
5. Invitado puede ingresar, recuperar la estadía por patente y registrar salida.
6. `pm2 logs` no muestra errores nuevos.
