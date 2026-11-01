# API Endpoints Documentation

## Global Information
- **VERSION**: `1.0`
- **HTTP METHOD**: `POST`
- **CONTENT TYPE**: `application/json`

### HEADERS
- **x-api-version**: `1.0` (Mandatory)
- **x-access-token**: `<token>` (Mandatory on private routes)


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
  "error": {
    "type": "string",
    "message": "string"
  }
}
```

### SUCESS CODES

| **HTTP Code** | **Meaning** |
|---|---|
| **200** | **Valid request; processed successfully.** |
| **202** | **Valid request; accepted for further processing (returns an ID).** |

**SUCESS FORMAT:**

```json
{
  "status": "success",
  "data": { ... }
}
```

## Authentication

### Login
- **URL**: `/services/auth/login`
- **FUNCTION**: `Authenticates a user and returns the session token.`
- **PERMISSION**: `Public`
- **BODY REQUEST**:
```json
{
  "email": "string",
  "password": "string"
}
```
- **RESPONSE**:
  *(Nota: El token se devuelve en el header `x-access-token`)*
```json
{
  "status": "success",
  "data": {
    "message": "Login exitoso",
    "user": {
      "idUser": "number",
      "name": "string",
      "surname": "string",
      "role": "string"
    }
  }
}
```

- **SPECIAL RESPONSE:** 
  *User has temporary password.*
```json
{
  "status": "success",
  "data": {
    "message": "Contraseña temporal utilizada, redirección a cambio de contraseña",
    "redirectToChangePassword": true,
    "user": { ... }
  }
}
```

### Logout
- **URL**: `/services/auth/logout`
- **FUNCTION**: `Ends the user's active session.`
- **PERMISSION**: `Private (Roles: MEMBER, CLUB_ADMIN, SUPER_ADMIN)`
- **AUTHORIZATION**: `x-access-token: <token>`
- **BODY REQUEST**:
```json
{}
```
- **RESPONSE**:
```json
{
  "status": "success",
  "data": { "message": "Sesión cerrada correctamente" }
}
```

### Change Password
- **URL**: `/services/auth/changePassword`
- **FUNCTION**: `Allows an authenticated user to change their current password.`
- **PERMISSION**: `Private (Roles: MEMBER, CLUB_ADMIN, SUPER_ADMIN)`
- **AUTHORIZATION**: `x-access-token: <token>`
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
  "status": "success",
  "data": { "message": "La contraseña ha sido modificada con éxito." }
}
```


## Membership Applications

### Create Membership Application
- **URL**: `/services/membership/createMembershipApplication`
- **FUNCTION**: `Allows a visitor to apply to become a club member. Upon completing the application, the system creates a user with the role: NONE and status: PENDING until the club administrator approves the application.`
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
  "status": "success",
  "data": { "message": "Solicitud enviada correctamente. Pronto nos comunicaremos vía mail." }
}
```

### List Membership Applications
- **URL**: `/services/membership/listMembershipApplications`
- **FUNCTION**: `Allows the administrator to list all membership requests.`
- **PERMISSION**: `Private (Roles: CLUB_ADMIN, SUPER_ADMIN)`
- **AUTHORIZATION**: `x-access-token: <token>`
- **BODY REQUEST**:
```json
{}
```
- **RESPONSE**:
```json
{
  "status": "success",
  "data": {
    "applications": [
      {
        "idUser": "number",
        "name": "string",
        "surname": "string",
        "dni": "number",
        "birthdate": "date",
        "email": "string",
        "phone": "string",
        "creationDate": "date",
        "status": "PENDINGFORAPPROBATION",
        "role": "NONE"
      }
    ]
  }
}
```

### Approve Membership Application
- **URL**: `/services/membership/approveMembershipApplication`
- **FUNCTION**: `Allows the administrator to approve a request. Upon approval, the system changes the user's status to APPROVE, assigns the role MEMBER, and sets the ID number as the temporary password.`
- **PERMISSION**: `Private (Roles: CLUB_ADMIN, SUPER_ADMIN)`
- **AUTHORIZATION**: `x-access-token: <token>`
- **BODY REQUEST**:
```json
{
  "idUser": "number"
}
```
- **RESPONSE**:
```json
{
  "status": "success",
  "data": { "message": "Solicitud aprobada. El usuario deberá cambiar su contraseña en el próximo login." }
}
```

### Reject Membership Application
- **URL**: `/services/membership/rejectMembershipApplication`
- **FUNCTION**: `Allows the administrator to reject a membership application.`
- **PERMISSION**: `Private (Roles: CLUB_ADMIN, SUPER_ADMIN)`
- **AUTHORIZATION**: `x-access-token: <token>`
- **BODY REQUEST**:
```json
{
  "idUser": "number"
}
```
- **RESPONSE**:
```json
{
  "status": "success",
  "data": { "message": "Solicitud rechazada correctamente." }
}
```

### Deactivate Membership Request
- **URL**: `/services/membership/deactivateMyMembership`
- **FUNCTION**: `Allows an authenticated member to voluntarily cancel their club membership. When this action is performed, the account status changes to INACTIVE, and all current activity registrations are automatically canceled.`
- **PERMISSION**: `Private (Role: MEMBER) `
- **AUTHORIZATION**: `x-access-token: <token>`
- **BODY REQUEST**:
```json
{}
```
- **RESPONSE**:
```json
{
  "status": "success",
  "data": { "message": "Tu membresía fue dada de baja correctamente." }
}
```


## Members

### List Members
- **URL**: `/services/member/listMembers`
- **FUNCTION**: `Allows the club administrator to list members with the role: MEMBER.`
- **PERMISSION**: `Private (Roles: CLUB_ADMIN, SUPER_ADMIN)`
- **AUTHORIZATION**: `x-access-token: <token>`
- **BODY REQUEST**:
```json
{}
```
- **RESPONSE**:
```json
{
  "status": "success",
  "data": {
    "members": [
      {
        "idUser": "number",
        "name": "string",
        "surname": "string",
        "dni": "number",
        "birthdate": "date",
        "email": "string",
        "phone": "string",
        "creationDate": "date",
        "status": "string"
      }
    ]
  }
}
```

### Get Member
- **URL**: `/services/member/getMember`
- **FUNCTION**: `It allows the club administrator to obtain complete information about a specific member.`
- **PERMISSION**: `Private (Roles: CLUB_ADMIN, SUPER_ADMIN)`
- **AUTHORIZATION**: `x-access-token: <token>`
- **BODY REQUEST**:
```json
{ 
  "idUser": "number"
}
```
- **RESPONSE**:
```json
{
  "status": "success",
  "data": {
    "profile": {
      "idUser": "number",
      "name": "string",
      "surname": "string",
      "dni": "number",
      "birthdate": "date",
      "email": "string",
      "phone": "string",
      "creationDate": "date",
      "active": "boolean"
    }
  }
}
```

### Update Member
- **URL**: `/services/member/updateMember`
- **FUNCTION**: `It allows the club administrator to modify member information, including sensitive data such as name or DNI number`
- **PERMISSION**: `Private (Roles: CLUB_ADMIN, SUPER_ADMIN)`
- **AUTHORIZATION**: `x-access-token: <token>`
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
  "status": "success",
  "data": { "message": "Datos del socio actualizados correctamente." }
}
```

### Deactivate Member
- **URL**: `/services/member/deactivateMember`
- **FUNCTION**: `Allows the club administrator to deactivate a member's membership (status: INACTIVE).`
- **PERMISSION**: `Private (Roles: CLUB_ADMIN, SUPER_ADMIN)`
- **AUTHORIZATION**: `x-access-token: <token>`
- **BODY REQUEST**:
```json
{ 
  "idUser": "number"
}
```
- **RESPONSE**:
```json
{
  "status": "success",
  "data": { "message": "Socio dado de baja correctamente." }
}
```

### Activate Member
- **URL**: `/services/member/activateMember`
- **FUNCTION**: `Allows the club administrator to reactivate a member's membership. The system restores the member's status to what it was before they were deactivated (previousStatus); if no previous status is on record, the status is set to ACTIVE by default.`
- **PERMISSION**: `Private (Roles: CLUB_ADMIN, SUPER_ADMIN)`
- **AUTHORIZATION**: `x-access-token: <token>`
- **BODY REQUEST**:
```json
{ 
  "idUser": "number"
}
```
- **RESPONSE**:
```json
{
  "status": "success",
  "data": { "message": "Socio reactivado correctamente." }
}
```

## Member Profile

### Get Member Profile
- **URL**: `/services/memberProfile/getMemberProfile`
- **FUNCTION**: `It allows members to access their personal information.`
- **PERMISSION**: `Private (Role: MEMBER) `
- **AUTHORIZATION**: `x-access-token: <token>`
- **BODY REQUEST**:
```json
{}
```
- **RESPONSE**:
```json
{
  "status": "success",
  "data": {
    "profile": {
      "idUser": "number",
      "name": "string",
      "surname": "string",
      "dni": "number",
      "birthdate": "date",
      "email": "string",
      "phone": "string",
    }
  }
}
```

### Update Member Profile
- **URL**: `/services/memberProfile/updateMemberProfile`
- **FUNCTION**: `Allows members to edit the personal information they are authorized to access (phone number).`
- **PERMISSION**: `Private (Role: MEMBER) `
- **AUTHORIZATION**: `x-access-token: <token>`
- **BODY REQUEST**:
```json
{
  "phone": "number"
}
```
- **RESPONSE**:
```json
{
  "status": "success",
  "data": { "message": "Perfil actualizado correctamente." }
}
```



## Activities

### Create Activity
- **URL**: `/services/activity/createActivity`
- **FUNCTION**: `Allows the club administrator to create a new club activity.`
- **PERMISSION**: `Private (Roles: CLUB_ADMIN, SUPER_ADMIN)`
- **AUTHORIZATION**: `x-access-token: <token>`
- **BODY REQUEST**:
```json
{
  "name": "string",
  "description": "string",
  "startDate": "date",
  "endDate": "date",
  "instructor": "string",
  "capacity": "number",
  "scope": "string"
  "schedules": [
    { 
      "day": "string", 
      "startTime": "date(hour)", 
      "endTime": "date(hour)" 
    }
  ]
}
```
- **RESPONSE**:
```json
{
  "status": "success",
  "data": { "message": "Actividad creada correctamente." }
}
``` 

### Update Activity
- **URL**: `/services/activity/updateActivity`
- **FUNCTION**: `Allows the club administrator to edit an existing activity.`
- **PERMISSION**: `Private (Roles: CLUB_ADMIN, SUPER_ADMIN)`
- **AUTHORIZATION**: `x-access-token: <token>`
- **BODY REQUEST**:
```json
{
  "idActivity": "number",
  "name": "string",
  "description": "string",
  "startDate": "date",
  "endDate": "date",
  "instructor": "string",
  "capacity": "number",
  "scope": "string"
  "schedules": [
    { 
      "day": "string", 
      "startTime": "date(hour)", 
      "endTime": "date(hour)" 
    }
  ]
}
```
- **RESPONSE**:
```json
{
  "status": "success",
  "data": { "message": "Actividad actualizada correctamente." }
}
``` 

### List Active Activities
- **URL**: `/services/activity/listActiveActivities`
- **FUNCTION**: `This feature allows you to list all active activities (status: ACTIVE). It is publicly accessible and is used to display the available activities on the home page and in the member dashboard.`
- **PERMISSION**: `Public`
- **BODY REQUEST**:
```json
{}
```
- **RESPONSE**:
```json
{
  "status": "success",
  "data": {
    "activities": [
      {
        "idActivity": "number",
        "name": "string",
        "description": "string",
        "instructor": "string",
        "capacity": "number",
        "startDate": "date",
        "endDate": "date",
        "availablePlaces": "number",
        "scope": "string",
        "status": "string",
        "schedules": [
          { 
            "day": "string", 
            "startTime": "date(hour)", 
            "endTime": "date(hour)" 
          }
        ]
      }
    ]
  }
}
``` 

### List All Activities
- **URL**: `/services/activity/listAllActivities`
- **FUNCTION**: `It allows the club administrator to view the complete list of activities, including both active ones and those that have been deactivated (INACTIVE).`
- **PERMISSION**: `Private (Roles: CLUB_ADMIN, SUPER_ADMIN)`
- **AUTHORIZATION**: `x-access-token: <token>`
- **BODY REQUEST**:
```json
{}
```
- **RESPONSE**:
```json
{
  "status": "success",
  "data": {
    "activities": [
      {
        "idActivity": "number",
        "name": "string",
        "description": "string",
        "instructor": "string",
        "capacity": "number",
        "startDate": "date",
        "endDate": "date",
        "availablePlaces": "number",
        "scope": "string",
        "status": "string (ACTIVE, INACTIVE)",
        "schedules": [
          {
            "day": "string",
            "startTime": "string",
            "endTime": "string"
          }
        ]
      }
    ]
  }
}
```

### Deactivate Activity
- **URL**: `/services/activity/deactivateActivity`
- **FUNCTION**: `Allows the club administrator to deactivate an activity (status: INACTIVE).`
- **PERMISSION**: `Private (Roles: CLUB_ADMIN, SUPER_ADMIN)`
- **AUTHORIZATION**: `x-access-token: <token>`
- **BODY REQUEST**:
```json
{
  "idActivity": "number"
}
```
- **RESPONSE**:
```json
{
  "status": "success",
  "data": { "message": "Actividad dada de baja correctamente." }
}
``` 

### Activate Activity
- **URL**: `/services/activity/activateActivity`
- **FUNCTION**: `PAllows the club administrator to reactivate an activity (status `ACTIVE`).`
- **PERMISSION**: `Private (Roles: CLUB_ADMIN, SUPER_ADMIN)`
- **AUTHORIZATION**: `x-access-token: <token>`
- **BODY REQUEST**:
```json
{
  "idActivity": "number"
}
```
- **RESPONSE**:
```json
{
  "status": "success",
  "data": { "message": "Actividad reactivada correctamente." }
}
``` 

## Activities Registration

### Register Member To Activity 
- **URL**: `/services/activitiesRegistration/registerMemberToActivity`
- **FUNCTION**: `Allows a member to sign up for an available activity. Checks availability and schedule conflicts.`
- **PERMISSION**: `Private (Role: MEMBER) `
- **AUTHORIZATION**: `x-access-token: <token>`
- **BODY REQUEST**:
```json
{
  "idActivity": "number"
}
```
- **RESPONSE**:
```json
{
  "status": "success",
  "data": { "message": "¡Te inscribiste con éxito a la actividad!" }
}
``` 

### Cancel Registration 
- **URL**: `/services/activitiesRegistration/cancelRegistration`
- **FUNCTION**: `Allows a member to cancel their registration for an activity.`
- **PERMISSION**: `Private (Role: MEMBER) `
- **AUTHORIZATION**: `x-access-token: <token>`
- **BODY REQUEST**:
```json
{
  "idActivity": "number"
}
```
- **RESPONSE**:
```json
{
  "status": "success",
  "data": { "message": "Inscripción cancelada correctamente." }
}
``` 

### List Member Registrations 
- **URL**: `/services/activitiesRegistration/listMemberRegistrations`
- **FUNCTION**: `It allows members to view a list of all the activities they are enrolled in.`
- **PERMISSION**: `Private (Role: MEMBER) `
- **AUTHORIZATION**: `x-access-token: <token>`
- **BODY REQUEST**:
```json
{}
```
- **RESPONSE**:
```json
{
  "status": "success",
  "data": {
    "registrations": [
      {
        "idActivity": "number",
        "name": "string",
        "description": "string",
        "instructor": "string",
        "registrationDate": "date",
        "schedules": [
          { 
          "day": "string", 
          "startTime": "date(hour)", 
          "endTime": "date(hour)" }
        ]
      }
    ]
  }
}
``` 

### List Registrations By Activity 
- **URL**: `/services/activitiesRegistration/listRegistrationsByActivity`
- **FUNCTION**: `It allows the administrator to view all members registered for a specific activity.`
- **PERMISSION**: `Private (Roles: CLUB_ADMIN, SUPER_ADMIN)`
- **AUTHORIZATION**: `x-access-token: <token>`
- **BODY REQUEST**:
```json
{
  "idActivity": "number"
}
```
- **RESPONSE**:
```json
{
  "status": "success",
  "data": {
    "registrations": [
      {
        "idUser": "number",
        "name": "string",
        "surname": "string"
      }
    ]
  }
}
``` 

### Remove Member From Activity 
- **URL**: `/services/activitiesRegistration/removeMemberFromActivity`
- **FUNCTION**: `Allows the administrator to remove a member from an activity in which they are enrolled.`
- **PERMISSION**: `Private (Roles: CLUB_ADMIN, SUPER_ADMIN)`
- **AUTHORIZATION**: `x-access-token: <token>`
- **BODY REQUEST**:
```json
{
  "idUser": "number",
  "idActivity": "number"
}
```
- **RESPONSE**:
```json
{
  "status": "success",
  "data": { "message": "Inscripción cancelada correctamente." }
}
```