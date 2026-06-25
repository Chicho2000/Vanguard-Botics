# 📋 Resumen de Cambios Recientes — Vanguard Botics

## Período: 31 de Mayo al 15 de Junio de 2026

## Detalles de Lógica y Funcionamiento Crítico

### 1. ¿Cómo funciona la eliminación de usuarios

La eliminación de usuarios en Vanguard Botics se realiza de forma **Física y Permanente** a nivel de base de datos. Sin embargo, para evitar violaciones de integridad referencial (claves foráneas/FK constraints) y garantizar que la base de datos no quede en un estado inconsistente, se implementó una **transacción de cascada manual y segura** en `src/repositories/user.repository.ts` usando `$transaction`:

- **Paso 1 (Obtención de Relaciones):** Se buscan todas las suscripciones (`Subscription`) y todos los vehículos (`Vehicle`) vinculados al ID del usuario.
- **Paso 2 (Obtención de Sesiones de Estacionamiento):** Se recuperan todas las sesiones de estacionamiento (`ParkingSession`) correspondientes a los vehículos del usuario.
- **Paso 3 (Liberación Preventiva de Cocheras):** Si alguna sesión está en estado `ACTIVE`, **se actualizan los espacios de estacionamiento asociados (`ParkingSpot`) marcando `isOccupied: false`**. Esto evita que queden cocheras permanentemente marcadas como ocupadas por vehículos que ya no existen.
- **Paso 4 (Eliminación de Pagos):** Se eliminan todos los registros de pago (`Payment`) relacionados con las suscripciones o sesiones de estacionamiento obtenidas.
- **Paso 5 (Limpieza en Orden de Restricción):** Se eliminan las sesiones de estacionamiento, luego las suscripciones y posteriormente los vehículos.
- **Paso 6 (Eliminación del Usuario):** Finalmente se elimina el registro del usuario (`User`).
  Todo este proceso se ejecuta de manera atómica: si algún paso falla, la transacción se revierte (`rollback`) por completo, protegiendo la base de datos de datos huérfanos.

  --En el futuro voy a revisar de ver alguna mejor opcion como habiamso hablado apra los invitados la clase pasada.--

### 2. Flujo de Registro de Vehículos y Autoprovisionamiento de Abono

Para eliminar datos inventados o simulados en los paneles administrativos y vistas de clientes:

- **Frontend (Formulario de Registro y Modal Admin):**
  - En el formulario de registro del cliente ([Login.tsx](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/Proyecto/src/components/Login.tsx)) y en el modal de creación/edición de usuarios de administración ([UsuariosAdmin.tsx](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/Proyecto/src/pages/UsuariosAdmin.tsx)) se agregaron campos para registrar la patente (`patente`), marca (`marca`/`brand`), modelo (`modelo`/`model`) y color del vehículo.
- **Backend (Creación y Edición de Usuarios):**
  - Al recibir los datos en [user.service.ts](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/src/services/user.service.ts) y [auth.service.ts](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/src/services/auth.service.ts), si se proporciona una patente, se busca si el vehículo ya existe o se crea uno nuevo asignándole el usuario.
  - **Autoprovisionamiento de Abono:** Si se registra una patente, el sistema crea automáticamente una suscripción activa diaria (`DAILY`) de 24 horas y le genera un registro de pago con estado `APPROVED` y método `MERCADO_PAGO`. Esto garantiza que los usuarios registrados con auto tengan automáticamente el derecho a un lugar reservado.

### 3. Mapeo Dinámico de Vehículos en Cocheras Reservadas

- En el servicio de cocheras ([floor.service.ts](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/src/services/floor.service.ts)), se reemplazó la generación de datos inventados por una lógica basada en suscripciones reales.
- El sistema busca todos los vehículos cuyos dueños tengan suscripciones activas (`status: "ACTIVE"`) pero que **no** tengan una sesión de estacionamiento activa (es decir, que no hayan ingresado físicamente).
- Estos vehículos con suscripción son asignados de forma dinámica y secuencial a los espacios de estacionamiento configurados como `RESERVED` que estén vacíos.
- En el frontend ([MapaAdmin.tsx](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/Proyecto/src/pages/MapaAdmin.tsx)), el mapa de cochera renderiza las patentes y descripciones reales (marca, modelo, color) en los tooltips al pasar el mouse por encima de los lugares reservados, mostrando exactamente qué auto tiene asignada la reserva en ese momento.

### 4. Consolidación de Identidad Visual (Logotipos e Íconos)

Se unificó el logotipo y estilo visual a lo largo de la aplicación reemplazando el texto estándar `VB` y los íconos genéricos `<Car>` de Lucide por el nuevo componente `<VanguardCarIcon>` con estilos premium de brillo neón:

- **Navbar principal:** ([Navbar.tsx](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/Proyecto/src/components/Navbar.tsx))
- **Paneles de administración:** ([DashboardAdmin.tsx](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/Proyecto/src/pages/DashboardAdmin.tsx))
- **Listados y modales:** ([UsuariosAdmin.tsx](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/Proyecto/src/pages/UsuariosAdmin.tsx))
- **Paneles cliente e invitado:** ([DashboardCliente.tsx](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/Proyecto/src/pages/DashboardCliente.tsx) y [DashboardInvitado.tsx](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/Proyecto/src/pages/DashboardInvitado.tsx))
- **Configuración del sistema:** ([ConfiguracionAdmin.tsx](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/Proyecto/src/pages/ConfiguracionAdmin.tsx))

---
