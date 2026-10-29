# 📚 Documentación Técnica - Proyecto Comunidad Activa

Este documento sirve como guía de referencia para el equipo de desarrollo. Aquí se explica la arquitectura del proyecto, el propósito de cada archivo y el detalle de las funciones más importantes.

---

## 🏗️ Arquitectura General

El proyecto sigue un patrón de arquitectura en capas (similar a MVC):
- **Base de Datos (SQLite):** Almacena la información (`schema.sql`).
- **Modelos (Backend):** Se encargan exclusivamente de las consultas SQL. No saben de HTTP.
- **Servicios (Backend):** Reciben la petición (`request`), validan la lógica de negocio, llaman al modelo y devuelven la respuesta (`response`).
- **Rutas / Middlewares (Backend):** Validan que el usuario tenga la sesión activa y el rol correcto antes de llegar al servicio.
- **Frontend:** Consume la API a través de `api.js` y dibuja el DOM usando `domUtils.js` y `helpers.js`.

---

## 🗄️ Base de Datos (`database/schema.sql`)

Contiene las tablas principales:
- `userStatus`: Estados posibles del usuario (ACTIVE, PENDING, etc.).
- `roles`: Roles del sistema (MEMBER, CLUB_ADMIN, SUPER_ADMIN).
- `users`: Datos de los socios y administradores.
- `activities`: Datos generales de las actividades.
- `activitySchedules`: Días y horarios de cada actividad.
- `activityRegistrations`: Relación entre usuarios y actividades (inscripciones).

---

## ⚙️ Backend - Modelos (`models/`)

Los modelos son las funciones que interactúan directamente con la base de datos.

### 📄 `models/user.js`

**1. `getUserBySessionKeyDB(sessionKey)`**
- **¿Qué hace?** Busca un usuario en la base de datos a partir de su `sessionKey` (el token).
- **¿Para qué sirve?** Es la función que usa el middleware `auth.js` en cada petición privada para saber quién está haciendo la petición.
- **Análisis:** Está perfecta. Solo trae las 3 columnas necesarias (`idUser`, `idRole`, `idStatus`), lo cual es muy eficiente. Devuelve `null` si no lo encuentra (lo cual es correcto para que el middleware sepa que el token es inválido).

**2. `getUserByIdDB(IDuser)`**
- **¿Qué hace?** Busca todos los datos de un usuario a partir de su ID.
- **¿Para qué sirve?** Se usa en el perfil del socio, en el panel del admin cuando edita a alguien, y en el login.
- **Análisis:** Devuelve la fila completa (incluyendo `password` y `sessionKey`). *Ojo con esto:* Traer la contraseña está bien a nivel de Modelo, pero el Servicio (`getMemberProfile`) hace muy bien en quitarla antes de enviarla al frontend usando destructuring `const { password, sessionKey, ...profile } = member;`.

**3. `listMembersDB()`**
- **¿Qué hace?** Trae una lista de todos los usuarios que tengan el rol `MEMBER` (ID 2).
- **¿Para qué sirve?** Para llenar la tabla de "Miembros" en el panel del administrador.
- **Análisis:** Excelente. Usa un `INNER JOIN` con la tabla `userStatus` para traer el nombre del estado en texto (ej. "ACTIVE") en lugar del ID numérico. Además, los ordena por apellido alfabéticamente.

**4. `changeMemberStatusDB(idStatus, idUser)`**
- **¿Qué hace?** Cambia el estado (`idStatus`) de un usuario.
- **¿Para qué sirve?** La usan tanto `deactivateMember` (pasando el 5, que es INACTIVE) como `activateMember` (pasando el 3, que es ACTIVE).
- **Análisis:** Está muy bien reutilizada. Al centralizar el `UPDATE`, no tuviste que escribir dos consultas distintas.

**5. `updateMemberDB(...)`**
- **¿Qué hace?** Actualiza los datos personales de un socio (nombre, apellido, DNI, fecha de nacimiento, teléfono y email).
- **¿Para qué sirve?** La usa el admin cuando edita a un socio.
- **Análisis:** Correcta. Pasa los 7 parámetros en el orden exacto de los signos de pregunta `?` del `UPDATE`.

**6. `updatePhoneDB(phone, idUser)`**
- **¿Qué hace?** Actualiza únicamente el teléfono de un usuario.
- **¿Para qué sirve?** La usa el socio cuando entra a su perfil y quiere actualizar su propio teléfono (`updateMemberProfile`).
- **Análisis:** Muy buena práctica. En lugar de hacer un `UPDATE` gigante que obligue al socio a modificar todos sus datos, creaste una función específica para lo único que él puede cambiar.

**7. `updateSessionKeyDB(sessionKey, idUser)`**
- **¿Qué hace?** Actualiza (o borra) el token de sesión de un usuario.
- **¿Para qué sirve?** Se usa en el login (para guardar el nuevo token) y en el logout (para ponerlo en "NONE").
- **Análisis:** Perfecta. Es la encargada de manejar el ciclo de vida de la sesión.

**8. `updatePasswordStatusSessionDB(password, idStatus, sessionKey, idUser)`**
- **¿Qué hace?** Actualiza la contraseña, el estado (a ACTIVE) y la sesión (a NONE) en una sola consulta SQL.
- **¿Para qué sirve?** Se usa cuando el usuario cambia su contraseña por primera vez.
- **Análisis:** Excelente optimización. Es mucho más eficiente hacer un solo `UPDATE` que tres seguidos. Además, garantiza que si algo falla, no queden datos a medio actualizar.

---

### 📄 `models/activity.js`

**1. `listActiveActivitiesDB()`**
- **¿Qué hace?** Trae todas las actividades que estén en estado `ACTIVE`.
- **¿Para qué sirve?** Para mostrar las actividades en el Index y en el Perfil del Socio.
- **Análisis:** Muy completa. Calcula dinámicamente los cupos disponibles restando las inscripciones activas. Además, utiliza un bucle `for` para inyectarle los horarios (`schedules`) a cada actividad antes de devolverla.

**2. `createActivityDB(activityData, schedulesData)`**
- **¿Qué hace?** Inserta una nueva actividad y sus respectivos horarios.
- **¿Para qué sirve?** La usa el admin desde el panel cuando crea una nueva actividad.
- **Análisis:** Correcta. Inserta primero la actividad, obtiene su ID con `lastInsertRowid` y luego usa ese ID para insertar los horarios en la tabla `activitySchedules`.



---

## ⚙️ Backend - Servicios (`services/`)

Los servicios contienen la lógica de negocio y los "handlers" que reciben la petición HTTP.

### 📄 `services/auth.js`

**1. `login(request, response)`**
- **¿Qué hace?** Recibe email y contraseña, valida que el usuario exista, que su estado sea válido y genera un `sessionKey`.
- **¿Para qué sirve?** Para autenticar al usuario.
- **Análisis:** Muy seguro. Verifica el estado del usuario (rechaza a los `PENDINGFORAPPROBATION` o `INACTIVE`). Si el usuario tiene estado `PENDINGFORPASSWORDCHANGE`, devuelve un flag `redirectToChangePassword` para que el frontend lo obligue a cambiar la clave.

**2. `logout(request, response)`**
- **¿Qué hace?** Busca al usuario por su sesión y cambia su `sessionKey` a `"NONE"`.
- **Análisis:** Correcta. Es la forma más limpia de invalidar un token.

**3. `changePassword(request, response)`**
- **¿Qué hace?** Valida que la contraseña actual sea correcta, que la nueva cumpla los requisitos de seguridad, y actualiza la base de datos.
- **Análisis:** Excelente. Utiliza una sola consulta de actualización (`updatePasswordStatusSessionDB`) para cambiar la contraseña, pasar el estado a `ACTIVE` y borrar la sesión para obligar un re-login.

### 📄 `services/user.js`
- Contiene las funciones para listar miembros, actualizar perfiles, dar de baja, etc.

---

## 💻 Frontend (`frontend/js/`)

### 📄 `api.js`
Contiene el "motor" de conexión con el backend.


### 📄 `helpers.js`
Funciones utilitarias globales.
- **`formatDate` / `formatDateForHTML`:** Formatean las fechas de `YYYY-MM-DD` a `DD/MM/YYYY`.
- **`showMessage`:** Muestra un cartel (verde o rojo) en la pantalla.
- **`setupPasswordToggle`:** Activa el "ojito" 👁 para ver/ocultar contraseñas.
- **`getStatusBadge`:** Devuelve el HTML del cartelito de estado (Activo, Pendiente, etc.).
- **`handleLogout`:** Limpia el `localStorage` y redirige al login.

### 📄 `domUtils.js`
Contiene funciones para armar el DOM **sin usar `innerHTML`**.
- **`clearContainer(container)`:** Vacía un div usando un bucle `while` y `removeChild`.
- **`createSchedulesNode(schedules)`:** Crea los `<p>` de los días y horarios.
- **`createActivityCard(activity, options)`:** Crea la tarjeta completa de una actividad. Recibe un objeto `options` (ej: `{ showEnrollButton: true }`) para saber si debe mostrar el botón de inscribirse, el cupo, o el cartel de "Inscripto".

---

## 📌 Notas y Pendientes
Para ver las tareas pendientes, refactorizaciones y bugs conocidos, revisar el archivo **`TODO.md`** en esta misma carpeta.