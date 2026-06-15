# 📋 Resumen de Cambios Recientes — Vanguard Botics
## Período: 31 de Mayo al 15 de Junio de 2026

Este documento resume los cambios realizados en el proyecto Vanguard Botics, detallando su objetivo y la lógica de funcionamiento aplicada en cada uno.

---

## ⚙️ Cambios en el Backend y Lógica de Negocio

### 1. Eliminación Física de Usuarios en Cascada
* **Objetivo:** Permitir la baja definitiva de un usuario de forma segura, garantizando que no queden datos huérfanos ni cocheras bloqueadas en el sistema.
* **Lógica:** Se implementó una transacción de base de datos (`$transaction`) en [user.repository.ts](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/src/repositories/user.repository.ts) que elimina los registros vinculados en un orden jerárquico estricto:
  1. Identifica las suscripciones, vehículos y sesiones de estacionamiento del usuario.
  2. Si hay una sesión de estacionamiento activa, actualiza el estado del espacio de estacionamiento (`ParkingSpot`) a `isOccupied: false` para liberarlo de inmediato.
  3. Elimina los registros de pagos vinculados.
  4. Elimina de forma definitiva las sesiones de estacionamiento, las suscripciones, los vehículos y, por último, el usuario.

### 2. Autoprovisionamiento de Abono al Registrar Vehículo
* **Objetivo:** Automatizar la asignación de un espacio de estacionamiento reservado para los usuarios que ingresan con vehículo propio, eliminando registros simulados o manuales.
* **Lógica:** Al registrar un nuevo usuario (tanto en la página de registro de usuarios como a través del panel de administración), si se suministra una patente de vehículo:
  - Se crea o actualiza el registro en la tabla `Vehicle`.
  - Se genera automáticamente una suscripción activa de tipo diario (`DAILY`) por 24 horas.
  - Se asocia un pago de prueba aprobado (`APPROVED`) con método de pago `MERCADO_PAGO`.

### 3. Asignación Dinámica de Cocheras a Suscriptores
* **Objetivo:** Ocupar los espacios reservados del mapa únicamente con autos y usuarios reales que posean abonos vigentes.
* **Lógica:** En [floor.service.ts](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/src/services/floor.service.ts), se programó una consulta que busca a los usuarios con suscripción activa que no han iniciado una sesión de estacionamiento física (es decir, no están aparcados). Sus vehículos se asocian de manera temporal y secuencial a los slots marcados como `RESERVED` que estén vacíos, simulando su reserva asignada en el mapa en tiempo real.

### 4. Soporte Local de Base de Datos y Adaptador Prisma v7
* **Objetivo:** Resolver incompatibilidades de inicialización del cliente de Prisma tanto en el entorno de desarrollo local como en el servidor de producción.
* **Lógica:** Se habilitó el flag de previsualización `driverAdapters` en [schema.prisma](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/prisma/schema.prisma) y se reescribió [prisma.ts](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/src/lib/prisma.ts) para usar `@prisma/adapter-pg` sobre un Pool de conexiones Postgres con `ssl: false`, permitiendo la compatibilidad con conexiones seguras e inseguras según el entorno.

### 5. División Arquitectónica en Capas
* **Objetivo:** Desacoplar la lógica de base de datos de las peticiones HTTP para facilitar la mantenibilidad y la escalabilidad del sistema.
* **Lógica:** Se refactorizó la estructura backend separando el código en controladores (gestión de respuestas HTTP), servicios (lógica de negocio y validación), repositorios (consultas Prisma directas a la base de datos) y rutas.

---

## 🎨 Cambios en la Interfaz (Frontend)

### 1. Ampliación del Formulario de Registro de Cliente
* **Objetivo:** Solicitar al usuario los datos obligatorios de su auto para poder asignarle una suscripción inicial.
* **Lógica:** En [Login.tsx](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/Proyecto/src/components/Login.tsx), se añadieron campos al formulario de registro de nuevas cuentas para capturar la patente (`patente`), marca, modelo y color del auto, vinculando el vehículo directamente al nuevo perfil creado.

### 2. Gestión Manual de Autos desde el Panel Administrativo
* **Objetivo:** Permitir que los administradores controlen y modifiquen manualmente el vehículo asignado a un usuario registrado.
* **Lógica:** En [UsuariosAdmin.tsx](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/Proyecto/src/pages/UsuariosAdmin.tsx), se agregaron los campos de vehículo (patente, marca, modelo y color) al formulario modal de creación y edición. Cuando el administrador edita un usuario e introduce una patente, el sistema crea/actualiza el vehículo en el backend y le aprovisiona una suscripción y pago si no contaba con ellos.

### 3. Visualización Real en Tooltips de Cocheras Reservadas
* **Objetivo:** Mostrar de forma explícita a qué vehículo pertenece un espacio reservado dentro del mapa.
* **Lógica:** Se actualizó [MapaAdmin.tsx](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/Proyecto/src/pages/MapaAdmin.tsx) y la vista de cliente para que, al posicionar el cursor sobre un espacio en estado `RESERVED`, el tooltip flotante busque los datos asignados dinámicamente y renderice la patente, marca, modelo y color del auto asignado, eliminando cualquier dato simulado.

### 4. Unificación de Identidad Visual (Logos e Íconos)
* **Objetivo:** Consolidar la identidad visual del estacionamiento con una estética oscura neón de calidad premium.
* **Lógica:** Se reemplazaron todas las representaciones genéricas de vehículos `<Car>` de Lucide y los textos de logo `VB` por el componente SVG de marca `<VanguardCarIcon>` en:
  - Barra de navegación superior ([Navbar.tsx](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/Proyecto/src/components/Navbar.tsx)).
  - Los dashboards administrativos, clientes e invitados ([DashboardAdmin.tsx](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/Proyecto/src/pages/DashboardAdmin.tsx), [DashboardCliente.tsx](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/Proyecto/src/pages/DashboardCliente.tsx), [DashboardInvitado.tsx](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/Proyecto/src/pages/DashboardInvitado.tsx)).
  - La tabla de gestión de usuarios ([UsuariosAdmin.tsx](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/Proyecto/src/pages/UsuariosAdmin.tsx)).
  - El panel de configuración ([ConfiguracionAdmin.tsx](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/Proyecto/src/pages/ConfiguracionAdmin.tsx)).
