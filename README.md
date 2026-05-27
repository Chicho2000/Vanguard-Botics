# Vanguard Botics — Cochera Automática

Sistema de gestión inteligente para estacionamiento automatizado. Permite administrar pisos, espacios, vehículos, sesiones de estacionamiento, abonos y pagos de forma integral.

## Descripción del Proyecto

**Vanguard Botics** es una aplicación web diseñada para la administración completa de una cochera automática. El sistema contempla tanto a usuarios registrados (con cuenta y vehículos asociados) como a vehículos sin dueño registrado, identificados únicamente por su patente.

### Funcionalidades principales

- **Gestión de usuarios**: Registro y autenticación de usuarios con sus datos personales y sistema de roles (`ADMIN`, `CLIENTE`, `INVITADO`).
- **Registro de vehículos**: Alta de vehículos con patente, marca, modelo, color y dimensiones (alto, ancho, peso). Un vehículo puede pertenecer a un usuario registrado o ingresar sin cuenta.
- **Pisos y espacios**: Configuración de la cochera por pisos, cada uno con límites de altura, peso y ancho.
- **Sesiones de estacionamiento**: Registro de entrada y salida de vehículos, cálculo de minutos y monto cobrado.
- **Sistema de abonos**: Suscripciones por horas, diarias, mensuales o anuales para usuarios registrados.
- **Pagos**: Módulo de pagos integrado con soporte para Mercado Pago, efectivo y transferencia.

## 🛠️ Tech Stack

| Capa       | Tecnología                                           |
| ---------- | ---------------------------------------------------- |
| Frontend   | React 19 + TypeScript + Vite                         |
| Backend    | Node.js + Express 5 + TypeScript + JWT               |
| ORM        | Prisma 7 (con driver adapter `@prisma/adapter-pg`)   |
| Base datos | PostgreSQL en la nube (vía Supabase)                 |
| Estilos    | TailwindCSS 4                                        |
| Pagos      | Mercado Pago (integración planificada)               |

## 📁 Estructura del Proyecto

```
Chumi/
├── prisma/
│   ├── schema.prisma              # Modelo de datos completo
│   └── migrations/                # Migraciones de la BD
├── prisma.config.ts               # Configuración Prisma 7 (datasource URL)
├── src/                           # Backend (Express API)
│   ├── index.ts                   # Entry point (Express app + server)
│   ├── lib/
│   │   └── prisma.ts              # Instancia del PrismaClient con adapter
│   ├── repositories/              # Capa de acceso a datos (queries)
│   │   └── admin.repository.ts
│   ├── services/                  # Capa de lógica de negocio
│   │   └── admin.service.ts
│   ├── controllers/               # Capa HTTP (req/res)
│   │   └── admin.controller.ts
│   ├── routes/                    # Definición de endpoints
│   │   ├── auth.ts
│   │   ├── usuarios.ts
│   │   └── admin.ts
│   └── middleware/                # Autenticación y autorización
│       └── auth.ts
├── Proyecto/                      # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/            # Componentes reutilizables
│   │   │   ├── Login.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/                 # Vistas por rol
│   │   │   ├── DashboardAdmin.tsx
│   │   │   ├── DashboardCliente.tsx
│   │   │   └── DashboardInvitado.tsx
│   │   ├── services/              # Llamadas a la API
│   │   ├── context/               # AuthContext (estado global)
│   │   └── App.tsx                # Router principal
│   └── vite.config.ts
├── seed.ts                        # Script para crear usuarios de prueba
└── package.json                   # Dependencias raíz y scripts
```

## 🚀 Instalación y Setup

### Requisitos previos

- Node.js 18+
- npm

### Pasos de inicialización

**1. Clonar el repositorio**
```bash
git clone https://github.com/Chicho2000/Vanguard-Botics.git
cd Vanguard-Botics
```

**2. Instalar dependencias**
```bash
# Backend (raíz)
npm install

# Frontend
cd Proyecto
npm install
cd ..
```

**3. Configurar variables de entorno**
Crear un archivo `.env` en la raíz del proyecto (solicitar las credenciales de Supabase al administrador):

> **⚠️ IMPORTANTE:** Asegúrate de que el archivo se llame exactamente `.env` (no `.env.txt`) y esté ubicado en la **raíz del proyecto**, no dentro de la carpeta `prisma/`. Si usas Windows, ten cuidado de que no se guarde con extensiones ocultas.
```env
# Base de datos en la nube (Supabase)
DATABASE_URL="postgresql://usuario:password@host.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://usuario:password@host.pooler.supabase.com:5432/postgres"

JWT_SECRET="secreto_super_seguro_vanguard_botics"
FRONTEND_URL="http://localhost:5173"
PORT=3000
```

**4. Sincronizar Base de Datos y Generar Cliente de Prisma**
Dado que usamos Prisma versión 7, es necesario inicializar el cliente que se guarda en la carpeta `generated/`:
```bash
# Sincroniza tu base de datos con el esquema
npx prisma db push

# Genera los tipos de TypeScript del cliente
npx prisma generate
```

**5. (Opcional) Crear usuario admin de prueba**
```bash
npx tsx seed.ts
```
Esto crea el usuario `admin@chumi.com` con contraseña `admin1234`.

**6. Levantar todo el entorno de desarrollo**
```bash
npm run dev
```
Este único comando levanta backend y frontend simultáneamente gracias a `concurrently`.

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Prisma Studio** (opcional): `npx prisma studio` → http://localhost:5555

## 📌 Scripts disponibles

| Script | Comando | Descripción |
| --- | --- | --- |
| `dev` | `npm run dev` | Levanta backend + frontend juntos |
| `dev:backend` | `npm run dev:backend` | Solo el servidor Express |
| `dev:frontend` | `npm run dev:frontend` | Solo el frontend Vite |

## 🔑 Endpoints de la API

| Método | Ruta | Protegido | Descripción |
| --- | --- | --- | --- |
| POST | `/auth/login` | No | Login con email y password |
| POST | `/auth/login/invitado` | No | Login por patente (sin cuenta) |
| GET | `/auth/verify` | Sí | Verificar token JWT |
| POST | `/auth/logout` | No | Cerrar sesión |
| GET | `/admin/stats` | Admin | Stats del dashboard |
| GET | `/admin/activity` | Admin | Actividad reciente |
| GET | `/admin/floors` | Admin | Vista de pisos con ocupación |
