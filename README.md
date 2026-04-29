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
| Backend    | Node.js + Express + TypeScript + JWT                 |
| ORM        | Prisma 7                                             |
| Base datos | PostgreSQL (vía Docker)                              |
| Estilos    | TailwindCSS 4                                        |
| Pagos      | Mercado Pago (integración planificada)               |

## 📁 Estructura del Proyecto

```
Chumi/
├── prisma/
│   └── schema.prisma          # Modelo de datos completo
├── src/                       # Backend (Express API)
│   ├── index.ts               # Entry point
│   ├── routes/                # Endpoints (auth, usuarios)
│   └── middleware/            # Protecciones de ruta y JWT
├── Proyecto/                  # Frontend (React + Vite)
│   ├── src/                   # Componentes, vistas y contexto
│   ├── index.css              # Estilos Tailwind v4
│   └── vite.config.ts
├── docker-compose.yml         # Configuración de base de datos local
└── package.json               # Dependencias raíz y scripts de backend
```

## 🚀 Instalación y Setup

### Requisitos previos

- Node.js 18+
- Docker (para la base de datos)
- npm

### Pasos de inicialización

**1. Clonar el repositorio**
```bash
git clone https://github.com/Chicho2000/Vanguard-Botics.git
cd Vanguard-Botics
```

**2. Instalar dependencias**
```bash
# Instalar dependencias del Backend (Raíz)
npm install

# Instalar dependencias del Frontend
cd Proyecto
npm install
cd ..
```

**3. Configurar variables de entorno**
Crear un archivo `.env` en la raíz del proyecto basándote en el formato requerido (usarás la misma URL en ambos si es una base de datos local):
```env
# URL principal para consultas (Si usas Supabase, la del pooler puerto 6543)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/chumi"

# URL para migraciones y push (Conexión directa, puerto 5432)
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/chumi"

JWT_SECRET="secreto_super_seguro_vanguard_botics"
FRONTEND_URL="http://localhost:5173"
PORT=3000
```

**4. Generar el Cliente de Prisma y Sincronizar Base de Datos**
Dado que usamos Prisma versión 7, es necesario inicializar el cliente que se guarda en la carpeta `generated/`:
```bash
# Sincroniza tu base de datos con el esquema
npx prisma db push

# Genera los tipos de TypeScript del cliente
npx prisma generate
```

**4. Levantar la Base de Datos (Docker)**
```bash
docker-compose up -d
```

**5. Ejecutar migraciones y generar cliente de Prisma**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

**6. Levantar los servidores de desarrollo**
El proyecto requiere correr el backend y el frontend en simultáneo en dos terminales separadas.

*Terminal 1 (Backend):*
```bash
npm run dev:backend
```

*Terminal 2 (Frontend):*
```bash
cd Proyecto
npm run dev
```

El frontend estará disponible en `http://localhost:5173` y la API en `http://localhost:3000`.
