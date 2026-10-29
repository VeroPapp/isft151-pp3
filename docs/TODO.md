# 📋 Backlog del Proyecto - Comunidad Activa

Este archivo sirve como registro centralizado de las tareas pendientes, mejoras y bugs que surgen durante el desarrollo.

> **Leyenda:**
> - `[ ]` Pendiente
> - `[x]` Completado
> - **Prioridad Alta 🔥**: Debe resolverse antes de la entrega final.
> - **Prioridad Baja 🔹**: Mejora opcional si sobra tiempo.

---

## 🛠️ Refactorizaciones y Arquitectura

- [ ] **Simplificar `RPCWebAPIFetch` en `frontend/js/api.js`**
  Actualmente tenemos dos funciones (`Public` y `Private`) con un 80% de código duplicado. La idea es unificarlas en una función base `fetchCore` y dejar las dos actuales como "envoltorios" para no tener que cambiar los HTMLs.

  **Solución propuesta:**
  ```javascript
  async function fetchCore(path, content, isPrivate) {
      const headers = {
          "Content-Type": "application/json",
          "x-api-version": "1.0"
      };
      if (isPrivate) {
          const token = localStorage.getItem("accessToken");
          if (token) headers["x-access-token"] = token;
      }
      // ... resto de la lógica de fetch, errores y guardado de token ...
  }

  async function RPCWebAPIFetchPublic(path, content = {}) {
      return await fetchCore(path, content, false);
  }

  async function RPCWebAPIFetchPrivate(path, content = {}) {
      return await fetchCore(path, content, true);
  }

- [ ] **Acomodar el scope alcance de las actividades**
    Dejar las opciones preestablecidas como "Solo Socios" y "Público General". Cuando se cree una nueva actividad, que la opción por defecto sea "Solo Socios".

## 🐛 Bugs y Correcciones

- [ ] **Error al reactivar un socio (panel admin)🔥**
    Si un socio está en PENDINGFORPASSWORDCHANGE y se lo da de baja y reactiva, vuelve como ACTIVE. Se pierde el estado anterior.

  **Solución propuesta (Agregar columna previousStatus):**


  ```sql
  1. Agregar a schema.sql en la tabla users:
  previousStatus INTEGER DEFAULT NULL,


  ```javascript
  2. Agregar en models/user.js:
  function deactivateMemberDB(idUser, inactiveStatusId) {
      const sql = `UPDATE users SET previousStatus = idStatus, idStatus = ? WHERE idUser = ?`;
      const stmt = objectDB.prepare(sql);
      return stmt.run(inactiveStatusId, idUser).changes > 0;
  }

  function activateMemberDB(idUser, defaultActiveStatusId) {
      const sql = `UPDATE users SET idStatus = COALESCE(previousStatus, ?), previousStatus = NULL WHERE idUser = ?`;
      const stmt = objectDB.prepare(sql);
      return stmt.run(defaultActiveStatusId, idUser).changes > 0;
  }

  3. Cambiar en services/user.js las funciones deactivateMember y activateMember para usar estas nuevas.

- [ ] **Mensaje de éxito del formulario (Index) no se ve**
  La página se recarga nativamente después de enviar el form de membresía, por lo que el cartel verde dura milisegundos. El event.preventDefault() no está siendo suficiente. Buscar la forma de frenar la recarga (ej. onsubmit="return false;" en el HTML) o mostrar el mensaje de otra forma (ej. SweetAlert o modal).

## ✨ Nuevas Funcionalidades (Features)
- [ ] **Endpoint para recuperar contraseña (Prioridad Alta)**
  Crear la ruta, el modelo y la vista para que un usuario pueda recuperar su contraseña olvidada (ej. enviar link por mail o generar clave temporal).
- [ ] **Enviar mail al aprobar membresía🔥**
  Cuando un admin aprueba una solicitud, enviar un correo automático al socio notificándole que fue aceptado, junto con sus credenciales de acceso (Email y contraseña temporal).
- [ ] **Baja del club para el socio🔹**
  Agregar en memberProfile.html un botón para que el socio pueda solicitar su baja del club o darse de baja directamente.
- [ ] **Redirigir al panel en vez de desloguear (Opcional)🔹**
  Cuando un usuario cambia su contraseña (ya sea por obligación o por elección), en lugar de borrar el token y mandarlo al login, renovar el token y redirigirlo a su perfil correspondiente.

## 📝 Validaciones y Detalles
- [ ] **Validar Fecha de Nacimiento (Index)**
  Actualmente el input type="date" tiene un max="2026-12-31". Modificar la lógica en JS para que la fecha no pueda ser futura con respecto al día de hoy (el año debe ser menor o igual al año actual).
- [ ] **Validar Teléfono🔹**
  Agregar una expresión regular o validación para asegurar que el teléfono ingresado sea un número válido (ej. solo números, longitud correcta).