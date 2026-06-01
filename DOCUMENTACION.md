# Vanguard Botics — Documentación del Proyecto y Registro de Horas

Este documento contiene el **Registro de Tiempos y Horas de Trabajo** del equipo del proyecto **Vanguard Botics** y la **Especificación de Documentación del Código** aplicada directamente en el proyecto siguiendo los lineamientos de la cátedra para mejorar el desarrollo en VS Code.

---

## 📅 Registro de Tiempos y Horas de Trabajo

Contabilizadas a partir del **lunes 25/05**:

### 📊 Resumen General de Horas
| Integrante | Horas Registradas | Estado |
| :--- | :---: | :---: |
| **Ciro** | 5.5 horas | Activo |
| **Sofi** | 5.0 horas | Activo |
| **Matias** | 3.5 horas | Activo |
| **Total General** | **14.0 horas** | - |

---

### 📝 Detalle por Integrante

#### 👤 Ciro
* **26/05**: 1.5 horas (1h 30m)
* **27/05**: 1.5 horas (1h 30m)
* **31/05**: 2.5 horas (2h 30m)
* **Total acumulado**: **5.5 horas**

#### 👤 Sofi
* **27/05**: 1.0 hora (1h 00m)
* **29/05**: 4.0 horas (4h 00m)
* **Total acumulado**: **5.0 horas**

#### 👤 Matias
* **25/05**: 2.0 horas (2h 00m)
* **31/05**: 1.5 horas (1h 30m)
* **Total acumulado**: **3.5 horas**

---

## 🛠️ Configuración de VS Code Aplicada

Se ha creado el archivo de configuración del espacio de trabajo [settings.json](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/.vscode/settings.json) con los parámetros recomendados para potenciar la experiencia en React, TypeScript y Tailwind CSS:

* **Soporte de Autocompletado Mejorado:** Habilitado para strings y llamadas a funciones.
* **Información Contextual (Hover & Parameter Hints):** Activado para visualizar los bloques de JSDoc de forma nativa al pasar el mouse por encima de los componentes o funciones.
* **Integración con Tailwind CSS:** Extendido para reconocer autocompletados en archivos `.js`, `.jsx`, `.ts` y `.tsx`.

---

## 📝 Código Documentado en Vanguard Botics

Se ha documentado el código fuente utilizando los estándares de **JSDoc** y **TSDoc** (TypeScript). A continuación se exponen las implementaciones realizadas en los componentes principales y archivos de utilidad del proyecto:

### 1. Componentes Documentados

#### 🧭 [Navbar.tsx](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/Proyecto/src/components/Navbar.tsx)
La barra de navegación principal que muestra el estado del usuario logueado.
```typescript
/**
 * @fileoverview Componente de barra de navegación principal para Vanguard Botics.
 * @version 1.0.0
 */

/**
 * Componente Navbar que muestra el título de la aplicación, el usuario autenticado
 * con su respectivo rol y el botón para cerrar la sesión actual.
 * 
 * @component
 * @returns {JSX.Element} La barra de navegación superior.
 */
export const Navbar: React.FC = () => { ... }
```

#### 🔒 [ProtectedRoute.tsx](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/Proyecto/src/components/ProtectedRoute.tsx)
El componente encargado de interceptar el acceso según la sesión y los roles de usuario.
```typescript
/**
 * @fileoverview Componente de ruta protegida para controlar el acceso según la autenticación y roles de usuario.
 * @version 1.0.0
 */

/**
 * Propiedades del componente ProtectedRoute.
 * 
 * @interface ProtectedRouteProps
 */
interface ProtectedRouteProps {
  /** Los componentes hijos que se renderizarán si el acceso es concedido. */
  children: React.ReactNode;
  /** Lista de roles permitidos para acceder a la ruta (ej: ['ADMIN', 'CLIENTE']). Si no se especifica, permite cualquier usuario autenticado. */
  allowedRoles?: string[];
}

/**
 * Componente que envuelve rutas para protegerlas. Verifica si el usuario está autenticado
 * y si posee alguno de los roles requeridos. En caso contrario, redirige al login o a la página correspondiente a su rol.
 * 
 * @component
 * @param {ProtectedRouteProps} props - Propiedades del componente.
 * @returns {JSX.Element} El contenido protegido o un redireccionamiento.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => { ... }
```

#### 🔘 [button.tsx](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/Proyecto/src/components/ui/button.tsx)
El botón genérico reutilizable con soporte de variantes de Tailwind CSS.
```typescript
/**
 * Componente de botón reutilizable construido sobre Radix UI Slot y Tailwind CSS.
 * Soporta variantes de diseño (default, outline, secondary, etc.) y tamaños usando class-variance-authority (cva).
 * 
 * @component
 * @param {Object} props - Propiedades del botón.
 * @param {string} [props.className] - Clases adicionales de CSS/Tailwind para personalizar el diseño.
 * @param {"default" | "outline" | "secondary" | "ghost" | "destructive" | "link"} [props.variant="default"] - Variante visual del botón.
 * @param {"default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"} [props.size="default"] - Tamaño físico del botón.
 * @param {boolean} [props.asChild=false] - Si es true, el botón renderizará su elemento hijo directamente (usando Radix Slot), útil para botones que actúan como enlaces (`<a>` o `<Link>`).
 * @returns {JSX.Element}
 */
function Button({ ... }) { ... }
```

---

### 2. Contextos y Hooks Documentados

#### 🔑 [AuthContext.tsx](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/Proyecto/src/context/AuthContext.tsx)
Contiene la declaración del contexto, proveedor de autenticación y el hook personalizado.
```typescript
/**
 * Tipo de dato que define las propiedades y métodos expuestos por el contexto de autenticación.
 * 
 * @interface AuthContextType
 */
interface AuthContextType {
  /** El objeto de usuario autenticado o null si no hay sesión activa. */
  user: User | null;
  /** Flag que indica si el usuario está autenticado. */
  isAuthenticated: boolean;
  /** Función para iniciar sesión mediante correo y contraseña. */
  login: (email: string, pass: string) => Promise<void>;
  /** Función para registrar un nuevo usuario en la plataforma. */
  register: (email: string, pass: string, name: string, phone?: string) => Promise<void>;
  /** Función para iniciar sesión como invitado usando una patente de vehículo. */
  loginInvitado: (licensePlate: string) => Promise<void>;
  /** Función para cerrar la sesión activa y limpiar el almacenamiento local. */
  logout: () => void;
  /** Flag que indica si hay una operación de autenticación en progreso. */
  isLoading: boolean;
}

/**
 * Proveedor del contexto de autenticación. Envuelve la aplicación o las rutas protegidas
 * para suministrar el estado de sesión y los métodos de login/registro a todos los componentes hijos.
 * 
 * @component
 * @param {Object} props - Propiedades del componente.
 * @param {ReactNode} props.children - Elementos hijos a renderizar.
 * @returns {JSX.Element} El proveedor de contexto de React.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => { ... }

/**
 * Hook personalizado para acceder de forma simplificada al contexto de autenticación.
 * Debe ser utilizado dentro del componente `AuthProvider`.
 * 
 * @returns {AuthContextType} El estado y métodos de autenticación del usuario.
 * @throws {Error} Si el hook se invoca fuera de un `AuthProvider`.
 * 
 * @example
 * const { user, logout } = useAuth();
 */
export const useAuth = () => { ... }
```

---

### 3. Servicios y Funciones de Utilidad Documentados

#### 📡 [auth.service.ts](file:///c:/Users/cirop/OneDrive/Escritorio/Chumi/Proyecto/src/services/auth.service.ts)
El servicio que realiza los llamados HTTP y gestiona las credenciales en almacenamiento.
```typescript
/**
 * @fileoverview Servicio de autenticación para realizar peticiones HTTP a la API de Vanguard Botics
 * y gestionar la sesión del usuario en el almacenamiento local (localStorage).
 * @version 1.0.0
 */

/**
 * Servicio encargado de gestionar el estado de autenticación y las peticiones al backend.
 */
export const authService = {
  /**
   * Inicia sesión en el sistema mediante correo electrónico y contraseña.
   * Almacena el token JWT y el perfil de usuario en el localStorage en caso de éxito.
   * 
   * @param {string} email - Correo electrónico del usuario.
   * @param {string} password - Contraseña del usuario.
   * @returns {Promise<any>} Promesa con los datos devueltos por el servidor (token, usuario).
   * @throws {Error} Si la respuesta HTTP no es exitosa o las credenciales son incorrectas.
   */
  async login(email: string, password: string) { ... },

  /**
   * Registra un nuevo usuario en la plataforma Vanguard Botics.
   * Almacena el token y el perfil devueltos en el localStorage en caso de éxito.
   * ...
   */
  async register(payload: { email: string; password: string; name: string; phone?: string }) { ... },

  /**
   * Inicia sesión para un usuario de tipo Invitado utilizando la patente de su vehículo.
   * Almacena el token de invitado en el localStorage.
   * ...
   */
  async loginInvitado(licensePlate: string) { ... },

  /**
   * Cierra la sesión del usuario actual eliminando los tokens de localStorage
   * y realizando una llamada para invalidar el token en el backend.
   * 
   * @returns {Promise<Response | void>} Promesa de la petición de logout (falla silenciosa).
   */
  logout() { ... }
}
```

---

## 💡 Conclusión & Regla de Oro

> **Regla de oro:**
> Si un componente o función va a ser usado por más de una persona (o por ti mismo dentro de un mes), documéntalo como si fuera para un completo desconocido.

Con JSDoc y un tipado correcto ya configurado en el proyecto, VS Code actuará como un asistente inteligente sugiriendo parámetros, autocompletando código y mostrando ayudas visuales con un simple hover en todo el flujo de trabajo de **Vanguard Botics**.
