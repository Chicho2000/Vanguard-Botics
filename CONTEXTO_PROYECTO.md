# Contexto Actual del Proyecto: Vanguard Botics

**Fecha de última actualización:** Abril 2026

Este archivo sirve como "punto de guardado" para saber exactamente dónde estamos parados y cómo retomar el desarrollo en la próxima sesión.

## 🟢 Lo que ya está terminado y funcionando

1. **Arquitectura Base Inicializada:**
   - **Frontend:** React 19 + TypeScript + Vite (ubicado en `/Proyecto`).
   - **Backend:** Node.js + Express + TypeScript (ubicado en `/src` en la raíz).
   - **Base de Datos:** PostgreSQL corriendo vía Docker (`docker-compose.yml`) en el puerto `5432`.
   - **ORM:** Prisma 7 configurado y con el cliente generado.
   - **Estilos:** Tailwind CSS v4 configurado correctamente en el frontend usando `@tailwindcss/postcss`.

2. **Sistema de Autenticación & Roles:**
   - Modelo de base de datos (`schema.prisma`) actualizado con `enum Role` (ADMIN, CLIENTE, INVITADO).
   - Endpoints de login creados (`/auth/login` y `/auth/login/invitado`).
   - Seguridad implementada con **JWT y Cookies HTTP-Only** + fallback en `localStorage`.
   - Middleware de protección de rutas backend (`requireAuth`, `requireAdmin`).
   - Contexto global en React (`AuthContext.tsx`).
   - Interfaz de Login estéticamente avanzada ("glassmorphism" y animaciones).
   - Ruteo protegido (`ProtectedRoute.tsx`) que redirige a `/admin`, `/cliente` o `/invitado`.

## 🟡 Próximos pasos a desarrollar (Roadmap)

1. **Integración con Supabase (Opcional/Visual):**
   - Conectar la base de datos PostgreSQL local (o migrarla) a un proyecto en Supabase para tener una interfaz visual (Studio) más amigable que permita ver tablas, filas y administrar usuarios fácilmente.

2. **Desarrollo de Paneles (Dashboards):**
   - **Admin:** Crear vista para ver usuarios, estado de la cochera en tiempo real y métricas financieras.
   - **Cliente:** Crear vista para ver historial de estacionamientos, agregar vehículos, ver estado de abonos.
   - **Invitado:** Crear vista minimalista ingresando solo con patente para ver cuánto tiempo lleva estacionado y cuánto debe pagar.

3. **Lógica de Estacionamiento:**
   - Crear endpoint para simular la "Entrada" de un auto (ocupar un `ParkingSpot`, crear un `ParkingSession`).
   - Crear endpoint para "Salida" (calcular minutos totales).

4. **Pagos:**
   - Integrar SDK de Mercado Pago.
   - Flujo de cobro dinámico según si es invitado (pago por hora) o cliente (pago por hora descontado, o por abono activo).

## 💡 Comandos Rápidos para Arrancar

- **Levantar BD:** `docker-compose up -d`
- **Backend:** `npm run dev:backend` (puerto 3000)
- **Frontend:** `cd Proyecto && npm run dev` (puerto 5173)
