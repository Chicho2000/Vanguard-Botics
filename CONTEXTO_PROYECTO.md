# Contexto Actual del Proyecto: Vanguard Botics

**Fecha de última actualización:** 5 de julio de 2026

Este archivo sirve como "punto de guardado" para saber exactamente dónde estamos parados y cómo retomar el desarrollo en la próxima sesión.

## Actualización de julio 2026

- El esquema Prisma está dividido por tabla dentro de `prisma/schema/models/`.
- Clientes y administradores pueden asignar o cambiar cocheras; una reasignación administrativa mueve también la sesión activa.
- El panel invitado consulta sesiones reales por patente y ya no muestra un QR decorativo.
- Patentes, teléfonos y marcas se validan de forma compartida en registro, administración y API de vehículos.
- El dashboard incluye ocupación real de todas las sesiones, resumen de registros y cocheras asignadas.
- El alta de clientes e invitados permite elegir marca y lugar; el modelo del auto ya no se solicita.
- La entrada y salida formal de vehículos está disponible y el admin ve hasta 100 movimientos históricos.

## Historial de los últimos cambios

### Trabajo realizado hoy — 5 de julio de 2026

- Se modularizó Prisma: cada tabla quedó en su propio archivo dentro de `prisma/schema/models/`, se actualizó `prisma.config.ts` y se agregó la migración `prisma/migrations/20260705000000_add_parking_spot_assignment/` para relacionar usuarios y cocheras.
- Se completó la validación compartida de patentes, marcas y teléfonos argentinos en `src/validation/schemas.ts`, `src/middleware/validate.ts` y `Proyecto/src/lib/validation.ts`. Las marcas se eligen desde `Proyecto/src/components/BrandSelect.tsx` y `Proyecto/src/lib/vehicle-brands.ts`, con alternativa «Otro».
- Se corrigieron autenticación, roles y recuperación de sesiones invitadas en `src/services/auth.service.ts`, `src/routes/auth.ts`, `src/middleware/auth.ts`, `Proyecto/src/services/auth.service.ts`, `Proyecto/src/context/AuthContext.tsx` y `Proyecto/src/components/Login.tsx`. Un invitado puede volver a entrar con su patente mientras su estadía siga activa y registrar manualmente la salida.
- Se implementó el ciclo real de estacionamiento en `src/services/parking-session.service.ts`, `src/repositories/parking-session.repository.ts`, `src/controllers/parking-session.controller.ts`, `src/routes/parking-sessions.ts`, `Proyecto/src/services/parking-session.service.ts` y `Proyecto/src/pages/DashboardInvitado.tsx`: ingreso, sesión activa, cálculo de tiempo, salida e historial.
- Se simplificó el traslado administrativo en `src/services/parking-spot.service.ts`, `src/controllers/parking-spot.controller.ts`, `src/routes/parking-spots.ts`, `Proyecto/src/services/admin.service.ts` y `Proyecto/src/pages/MapaAdmin.tsx`: se hace clic sobre un lugar ocupado o reservado, se elige el destino y, si está ocupado, se intercambian ambos lugares.
- Se reforzó la selección y visualización de lugares para clientes en `src/services/floor.service.ts`, `src/repositories/floor.repository.ts`, `Proyecto/src/services/parking-spot.service.ts` y `Proyecto/src/pages/DashboardCliente.tsx`.
- Se incorporaron invitados activos a Usuarios y al resumen administrativo mediante `src/services/user.service.ts`, `src/repositories/user.repository.ts`, `src/services/stats.service.ts`, `Proyecto/src/pages/UsuariosAdmin.tsx` y `Proyecto/src/pages/DashboardAdmin.tsx`. También se corrigió el fallo de renderizado que dejaba el panel admin en negro.
- Se corrigieron suscripciones, pagos y recaudación para que un cambio de plan reemplace el valor activo en lugar de acumularlo, mediante `src/services/subscription.service.ts`, `src/repositories/subscription.repository.ts`, `src/services/payment.service.ts`, `src/repositories/payment.repository.ts` y `Proyecto/src/services/subscription.service.ts`.
- Se realizó la limpieza puntual del vehículo invitado huérfano que ocupaba B2. Los scripts temporales usados para mantenimiento fueron retirados después de completar la tarea.
- Se ajustaron configuración, despliegue y arranque local en `src/index.ts`, `package.json`, `README.md`, `GUIA_DEPLOY_DETALLADA.md`, `Proyecto/eslint.config.js`, `Proyecto/src/pages/ConfiguracionAdmin.tsx` y `Proyecto/src/components/ui/BorderGlow.tsx`. El backend local ahora inicia sin el watcher que perdía acceso a la base tras reiniciarse.

### Commit anterior `474b1cf` — Matuti2611 — 5 de julio de 2026

**Objetivo:** validación de registro, edición de lugares desde administración y Dashboard mejorado.

- `Proyecto/src/components/Login.tsx`: validación de patente durante el registro.
- `Proyecto/src/pages/MapaAdmin.tsx` y `Proyecto/src/services/admin.service.ts`: edición administrativa de etiqueta, tipo y ancho de las cocheras.
- `Proyecto/src/pages/DashboardAdmin.tsx`: gráfico real de ocupación, recaudación, últimos registros y cocheras asignadas.
- `src/repositories/floor.repository.ts`, `src/services/floor.service.ts`, `src/services/stats.service.ts` y `src/routes/auth.ts`: datos y endpoints necesarios para alimentar esas vistas.

### Commit anterior `dcac7df` — sofiakopr — 4 de julio de 2026

**Objetivo:** permitir que los clientes elijan su lugar de estacionamiento.

- `prisma/schema.prisma`: relación entre usuario y cochera asignada.
- `src/controllers/parking-spot.controller.ts`, `src/routes/parking-spots.ts` y `src/services/parking-spot.service.ts`: endpoint y lógica de selección.
- `src/repositories/floor.repository.ts` y `src/services/floor.service.ts`: estado y propietario de cada lugar.
- `Proyecto/src/pages/DashboardCliente.tsx` y `Proyecto/src/services/admin.service.ts`: selección visual y actualización del mapa desde el cliente.

## 🟢 Lo que ya está terminado y funcionando

1. **Arquitectura base:**
   - **Frontend:** React 19 + TypeScript + Vite (ubicado en `/Proyecto`).
   - **Backend:** Node.js + Express + TypeScript (ubicado en `/src`).
   - **Base de datos:** PostgreSQL alojada en Supabase.
   - **ORM:** Prisma 7 con esquema modular y cliente generado.
   - **Estilos:** Tailwind CSS v4 mediante `@tailwindcss/postcss`.

2. **Autenticación y roles:**
   - Roles `ADMIN`, `CLIENTE` e `INVITADO`.
   - Endpoints `/auth/login`, `/auth/register` y `/auth/login/invitado`.
   - JWT, cookies HTTP-Only y middleware `requireAuth`/`requireAdmin`.
   - Contexto global React y rutas protegidas por rol.

3. **Paneles:**
   - **Admin:** métricas, resumen de registros, usuarios, mapa y configuración.
   - **Cliente:** abono, mapa y selección de cochera propia.
   - **Invitado:** sesión real, ubicación, tiempo y monto estimado por patente.

4. **Gestión de cocheras:**
   - Selección, cambio y liberación desde cliente.
   - Edición de etiqueta, tipo y ancho desde admin.
   - Asignación o traslado de clientes desde admin.

## 🟡 Próximos pasos

1. Integrar el SDK real de Mercado Pago y webhooks de confirmación.
2. Agregar gestión de múltiples vehículos por titular desde admin.
3. Dividir el bundle frontend por rutas para reducir la descarga inicial.

## 💡 Comandos rápidos

- **Backend:** `npm run dev:backend` (puerto 3000)
- **Frontend:** `cd Proyecto && npm run dev` (puerto 5173)
