# API Endpoints Documentation

## Global Information
- **VERSION**: `1.0`
- **HTTP METHOD**: `POST`
- **CONTENT TYPE**: `application/json`

### ERROR CODES

| **HTTP Code** | **Meaning** |
|---|---|
| **400** | **Invalid specification or input data.** |
| **401** | **User is not authenticated or does not have permission.** |
| **422** | **Error related to domain rules.** |
| **500** | **Internal server error.** |

**ERROR FORMAT:**

```json
{
  "exception": "value",
  "detail": [
    "string"
  ]
}
```
### SUCESS CODES

| **HTTP Code** | **Meaning** |
|---|---|
| **101** | **Provisional permission to send a request.** |
| **200** | **Valid request; processed successfully.** |
| **202** | **Valid request; accepted for further processing (returns an ID).** |


## Authentication

### Login
- **URL**: `/api/auth/login`
- **FUNCTION**: `Permite a un usuario autenticarse utilizando su email y contraseña.`
- **PERMISSION**: `Public`
- **BODY REQUEST**:
```json
{
  "email": "string",
  "password": "string"
}
```
- **RESPONSE**:
```json
{
  "idUser": "number", 
  "name": "string", 
  "surname": "string", 
  "role": "string", 
  "temporaryPassword": "boolean"
}
```

### Logout
- **URL**: `/api/auth/logout`
- **FUNCTION**: `Finaliza la sesión activa del usuario.`
- **PERMISSION**: `Usuario Autenticado`
- **AUTHORIZATION**: `Bearer <acessToken>`
- **BODY REQUEST**:
```json
{}
```
- **RESPONSE**:
```json
{
  "message": "Sesión cerrada correctamente" 
}
```

### Recover Password
- **URL**: `/api/auth/recoverPassword`
- **FUNCTION**: `Permite al usuario solicitar la recuperación de contraseña. Envía una nueva contraseña temporal al correo electrónico asociado a la cuenta.`
- **PERMISSION**: `Public`
- **BODY REQUEST**:
```json
{
  "email": "string"
}
```
- **RESPONSE**:
```json
{
  "message": "Nueva contraseña enviada al mail registrado."
}
```

### Change Password
- **URL**: `/api/auth/changePassword`
- **FUNCTION**: `Permite a un usuario autenticado cambiar su contraseña actual.`
- **PERMISSION**: `Usuario Autenticado`
- **AUTHORIZATION**: `Bearer <acessToken>`
- **BODY REQUEST**:
```json
{
  "currentPassword": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```
- **RESPONSE**:
```json
{
  "message": "Contraseña modificada correctamente" 
}
```

## Membership Applications

### Create Membership Application
- **URL**: `/api/membership/createMembershipApplication`
- **FUNCTION**: `Permite a un visitante solicitar su incorporación como socio del club. Al completar la solicitud, el sistema crea un usuario con rol socio y estado: PENDING hasta que el administrador de club apruebe la solicitud.`
- **PERMISSION**: `Public`
- **BODY REQUEST**:
```json
{
  "name": "string", 
  "surname": "string", 
  "dni": "number", 
  "birthdate": "date", 
  "email": "string", 
  "phone": "number"
}
```
- **RESPONSE**:
```json
{
  "message": "Solicitud enviada correctamente. Pronto nos comunicaremos vía mail." 
}
```

### List Membership Applications
- **URL**: `/api/membership/listMembershipApplications`
- **FUNCTION**: `Permite al administrador listar las solicitudes de membresía.`
- **PERMISSION**: `clubAdmin`
- **AUTHORIZATION**: `Bearer <acessToken>`
- **BODY REQUEST**:
```json
{
  "status": "string (PENDING)"
}
```
- **RESPONSE**:
```json
{
  "applications": [
    {
      "idApplication": "number",
      "name": "string",
      "surname": "string",
      "dni": "number",
      "birthdate": "date",
      "email": "string",
      "phone": "number",
      "status": "string"
    }
  ]
}
```

### Approve Membership Application
- **URL**: `/api/membership/approveMembershipApplication`
- **FUNCTION**: `Permite al administrador aprobar una solicitud. Al aprobarla, el sistema cambia el estado del usuario a aprobado y establece el DNI como contraseña temporal.`
- **PERMISSION**: `clubAdmin`
- **AUTHORIZATION**: `Bearer <acessToken>`
- **BODY REQUEST**:
```json
{
  "idApplication": "number"
}
```
- **RESPONSE**:
```json
{
  "message": "Solicitud aprobada correctamente", 
  "idUser": "number"
}
```

### Reject Membership Application
- **URL**: `/api/membership/rejectMembershipApplication`
- **FUNCTION**: `Permite al administrador rechazar una solicitud de membresía.`
- **PERMISSION**: `clubAdmin`
- **AUTHORIZATION**: `Bearer <acessToken>`
- **BODY REQUEST**:
```json
{
  "idApplication": "number"
}
```
- **RESPONSE**:
```json
{
  "message": "Solicitud rechazada correctamente" 
}
```

## Members

### List Members
- **URL**: `/api/member/listMembers`
- **FUNCTION**: `Permite al administrador de club consultar los socios registrados en el club.`
- **PERMISSION**: `clubAdmin`
- **AUTHORIZATION**: `Bearer <acessToken>`
- **BODY REQUEST**:
```json
{}
```
- **RESPONSE**:
```json
{
  "members": [ 
    { 
      "idUser": "number", 
      "name": "string", 
      "surname": "string", 
      "dni": "number", 
      "email": "string",
      "active": "boolean"
    } 
  ] 
}
```

### Get Member
- **URL**: `/api/member/getMember`
- **FUNCTION**: `Permite al administrador de club consultar la información completa de un socio específico.`
- **PERMISSION**: `clubAdmin`
- **AUTHORIZATION**: `Bearer <acessToken>`
- **BODY REQUEST**:
```json
{ 
  "idUser": "number"
}
```
- **RESPONSE**:
```json
{
  "idUser": "number", 
  "name": "string", 
  "surname": "string", 
  "dni": "number", 
  "birthdate": "date", 
  "email": "string", 
  "phone": "number", 
  "active": "boolean"
}
```

### Update Member
- **URL**: `/api/member/updateMember`
- **FUNCTION**: `Permite al administrador de club modificar los datos del socio, incluyendo datos sensibles como nombre o DNI.`
- **PERMISSION**: `clubAdmin`
- **AUTHORIZATION**: `Bearer <acessToken>`
- **BODY REQUEST**:
```json
{ 
  "idUser": "number",
  "name": "string",
  "surname": "string",
  "dni": "number",
  "birthdate": "date",
  "phone": "number",
  "email": "string"
}
```
- **RESPONSE**:
```json
{
  "message": "Datos del socio actualizados correctamente." 
}
```

### Remove Member
- **URL**: `/api/member/removeMember`
- **FUNCTION**: `Permite al administrador de club desactivar la membresía de un socio.`
- **PERMISSION**: `clubAdmin`
- **AUTHORIZATION**: `Bearer <acessToken>`
- **BODY REQUEST**:
```json
{ 
  "idUser": "number"
}
```
- **RESPONSE**:
```json
{
  "message": "Socio dado de baja correctamente." 
}
```

## Member Profile

### Get Member Profile
- **URL**: `/api/memberProfile/getMemberProfile`
- **FUNCTION**: `Permite al socio consultar sus datos personales.`
- **PERMISSION**: `member`
- **AUTHORIZATION**: `Bearer <acessToken>`
- **BODY REQUEST**:
```json
{}
```
- **RESPONSE**:
```json
{
  "idUser": "number", 
  "name": "string", 
  "surname": "string", 
  "dni": "number", 
  "birthdate": "date", 
  "email": "string", 
  "phone": "number"
}
```

### Update Member Profile
- **URL**: `/api/memberProfile/updateMemberProfile`
- **FUNCTION**: `Permite al socio modificar los datos personales que tiene autorizados.`
- **PERMISSION**: `member`
- **AUTHORIZATION**: `Bearer <acessToken>`
- **BODY REQUEST**:
```json
{
  "phone": "number"
}
```
- **RESPONSE**:
```json
{
  "message": "Perfil actualizado correctamente." 
}
```

### Get Member Activities
- **URL**: `/api/memberProfile/getMemberActivities`
- **FUNCTION**: `Permite al socio listar las actividades en las que se encuentra inscripto.`
- **PERMISSION**: `member`
- **AUTHORIZATION**: `Bearer <acessToken>`
- **BODY REQUEST**:
```json
{}
```
- **RESPONSE**:
```json
{
  "activities": [ 
    { 
        "idActivity": "number", 
        "name": "string",
        "startDate": "date", 
        "endDate": "date",
        "trainingDays": "string",
        "trainingTime": "string"
    } 
  ] 
}
``` 

### Get Member Activity by ID
- **URL**: `/api/memberProfile/getMemberActivityByID`
- **FUNCTION**: `Permite al socio consultar el detalle de una actividad en las que se encuentra inscripto.`
- **PERMISSION**: `member`
- **AUTHORIZATION**: `Bearer <acessToken>`
- **BODY REQUEST**:
```json
{
  "idActivity": "number"
}
```
- **RESPONSE**:
```json
{
  "idActivity": "number", 
  "name": "string", 
  "startDate": "date", 
  "endDate": "date",
  "trainingDays": "string",
  "trainingTime": "string"
}
``` 

## Activity

### Create Activity
- **URL**: `/api/activity/createActivity`
- **FUNCTION**: `Permite al administrador de club crear una nueva actividad del club.`
- **PERMISSION**: `clubAdmin`
- **AUTHORIZATION**: `Bearer <acessToken>`
- **BODY REQUEST**:
```json
{
  "name": "string",
  "description": "string",
  "startDate": "date",
  "endDate": "date",
  "professor": "string",
  "capacity": "number",
  "trainingDays": "string",
  "trainingTime": "string",
  "scope": "string"
}
```
- **RESPONSE**:
```json
{
  "idActivity": "number",
  "status": "string (ACTIVE)",
  "message": "Actividad creada correctamente"
}
``` 

### Update Activity
- **URL**: `/api/activity/updateActivity`
- **FUNCTION**: `Permite al administrador de club modificar una actividad existente.`
- **PERMISSION**: `clubAdmin`
- **AUTHORIZATION**: `Bearer <acessToken>`
- **BODY REQUEST**:
```json
{
  "idActivity": "number",
  "name": "string",
  "description": "string",
  "startDate": "date",
  "endDate": "date",
  "professor": "string",
  "capacity": "number",
  "trainingDays": "string",
  "trainingTime": "string",
  "scope": "string"
}
```
- **RESPONSE**:
```json
{
  "message": "Actividad modificada correctamente."
}
``` 

### Remove Activity
- **URL**: `/api/activity/removeActivity`
- **FUNCTION**: `Permite al administrador de club desactivar una actividad sin eliminarla definitivamente.`
- **PERMISSION**: `clubAdmin`
- **AUTHORIZATION**: `Bearer <acessToken>`
- **BODY REQUEST**:
```json
{
  "idActivity": "number"
}
```
- **RESPONSE**:
```json
{
  "message": "Actividad desactivada correctamente."
}
``` 

### List Activities
- **URL**: `/api/activity/listActivities`
- **FUNCTION**: `Permite al administrador de club listar las actividades disponibles del club.`
- **PERMISSION**: `clubAdmin`
- **AUTHORIZATION**: `Bearer <acessToken>`
- **BODY REQUEST**:
```json
{
  "name": "string", 
  "scope": "string",
  "status": "string (ACTIVE)"
}
```
- **RESPONSE**:
```json
{
  "activities": [
    {
      "idActivity": "number",
      "name": "string",
      "professor": "string",
      "capacity": "number",
      "availablePlaces": "number",
      "startDate": "date",
      "endDate": "date",
      "trainingDays": "string",
      "trainingTime": "string",
      "scope": "string"
    }
  ]
}
``` 

## Activities Registration

### Register Member To Activity 
- **URL**: `/api/activitiesRegistration/registerMemberToActivity`
- **FUNCTION**: `Permite a un socio inscribirse en una actividad disponible, siempre que cumpla las condiciones de inscripción y exista capacidad disponible.`
- **PERMISSION**: `member`
- **AUTHORIZATION**: `Bearer <acessToken>`
- **BODY REQUEST**:
```json
{
  "idActivity": "number"
}
```
- **RESPONSE**:
```json
{
  "message": "Inscripción realizada correctamente.",
  "idRegistration": "number"
}
``` 

### Cancel Registration 
- **URL**: `/api/activitiesRegistration/cancelRegistration`
- **FUNCTION**: `Permite a un socio cancelar su inscripción en una actividad.`
- **PERMISSION**: `member`
- **AUTHORIZATION**: `Bearer <acessToken>`
- **BODY REQUEST**:
```json
{
  "idActivity": "number"
}
```
- **RESPONSE**:
```json
{
  "message": "Inscripción cancelada correctamente."
}
``` 

### List Registrations By Activity 
- **URL**: `/api/activitiesRegistration/listRegistrationsByActivity`
- **FUNCTION**: `Permite al administrador consultar todos los socios inscriptos en una actividad determinada.`
- **PERMISSION**: `clubAdmin`
- **AUTHORIZATION**: `Bearer <acessToken>`
- **BODY REQUEST**:
```json
{
  "idActivity": "number"
}
```
- **RESPONSE**:
```json
{
  "activity": {
    "idActivity": "number",
    "name": "string"
    },

    "registrations": [
      {
        "idUser": "number",
        "name": "string",
        "surname": "string",
        "email": "string"
      }
    ]
}
``` 
