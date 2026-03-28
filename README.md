# Vanguard Botics — Cochera Automática

Sistema de gestión inteligente para estacionamiento automatizado. Permite administrar pisos, espacios, vehículos, sesiones de estacionamiento, abonos y pagos de forma integral.

## Descripción del Proyecto

**Vanguard Botics** es una aplicación web diseñada para la administración completa de una cochera automática. El sistema contempla tanto a usuarios registrados (con cuenta y vehículos asociados) como a vehículos sin dueño registrado, identificados únicamente por su patente.

### Funcionalidades principales

- **Gestión de usuarios**: Registro y autenticación de usuarios con sus datos personales.
- **Registro de vehículos**: Alta de vehículos con patente, marca, modelo, color y dimensiones (alto, ancho, peso). Un vehículo puede pertenecer a un usuario registrado o ingresar sin cuenta.
- **Pisos y espacios**: Configuración de la cochera por pisos, cada uno con límites de altura, peso y ancho. Los espacios individuales tienen coordenadas (fila/columna) para renderizar un mapa visual (grid), tipo de espacio (normal, discapacitados, carga EV, moto) y estado de ocupación.
- **Sesiones de estacionamiento**: Registro de entrada y salida de vehículos, cálculo de minutos y monto cobrado, con estados (activa, completada, cancelada).
- **Sistema de abonos**: Suscripciones por horas, diarias, mensuales o anuales para usuarios registrados, con control de vigencia y horas restantes.
- **Pagos**: Módulo de pagos integrado con soporte para Mercado Pago, efectivo y transferencia, vinculado tanto a sesiones como a abonos.

# Modelo de Base de Datos

La base de datos está modelada con **Prisma ORM** sobre **PostgreSQL** y cuenta con las siguientes entidades:

| Tabla              | Descripción                                                               |
| ------------------ | ------------------------------------------------------------------------- |
| `users`            | Usuarios registrados (email, password, nombre, teléfono)                  |
| `vehicles`         | Vehículos con patente, dimensiones y usuario opcional asociado            |
| `floors`           | Pisos de la cochera con límites físicos                                   |
| `parking_spots`    | Espacios individuales con coordenadas, tipo y estado                      |
| `parking_sessions` | Sesiones de entrada/salida con duración y costo                           |
| `subscriptions`    | Abonos (horas, diario, mensual, anual) para usuarios                      |
| `payments`         | Pagos vinculados a sesiones o abonos (MercadoPago/efectivo/transferencia) |

## Diagrama de relaciones

```
Users ──1:N──> Vehicles ──1:N──> ParkingSessions <──N:1── ParkingSpots <──N:1── Floors
  │                                     │
  └──1:N──> Subscriptions               │
                 │                       │
                 └────────> Payments <───┘
```

### Tipos enumerados

- **SpotType**: `NORMAL` | `DISABLED` | `EV_CHARGING` | `MOTORCYCLE`
- **SessionStatus**: `ACTIVE` | `COMPLETED` | `CANCELLED`
- **SubscriptionType**: `HOURS` | `DAILY` | `MONTHLY` | `YEARLY`
- **SubscriptionStatus**: `ACTIVE` | `EXPIRED` | `CANCELLED`
- **PaymentMethod**: `MERCADO_PAGO` | `CASH` | `TRANSFER`
- **PaymentStatus**: `PENDING` | `APPROVED` | `REJECTED`

## 🛠️ Tech Stack

| Capa       | Tecnología                             |
| ---------- | -------------------------------------- |
| Frontend   | React 19 + TypeScript + Vite           |
| ORM        | Prisma 7                               |
| Base datos | PostgreSQL                             |
| Estilos    | TailwindCSS 3                          |
| Pagos      | Mercado Pago (integración planificada) |

## 📁 Estructura del Proyecto

```
Chumi/
├── prisma/
│   └── schema.prisma          # Modelo de datos completo
├── prisma.config.ts           # Configuración de Prisma
├── mi-proyecto-react/         # Frontend React + Vite
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── ...
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── .env                       # Variables de entorno (NO subir al repo)
├── .gitignore
├── package.json               # Dependencias raíz (Prisma, Tailwind)
└── tailwind.config.js
```

## 🚀 Instalación y Setup

### Requisitos previos

- Node.js 18+
- PostgreSQL
- npm o yarn

### Pasos

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/Chicho2000/Vanguard-Botics.git
   cd Vanguard-Botics
   ```

2. **Instalar dependencias**

   ```bash
   # Dependencias raíz (Prisma, Tailwind)
   npm install

   # Dependencias del frontend
   cd mi-proyecto-react
   npm install
   ```

3. **Configurar variables de entorno**

   Crear un archivo `.env` en la raíz del proyecto con:

   ```env
   DATABASE_URL="postgresql://usuario:password@host:puerto/nombre_db"
   ```

4. **Generar el cliente de Prisma y aplicar migraciones**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Levantar el frontend en modo desarrollo**
   ```bash
   cd mi-proyecto-react
   npm run dev
   ```
