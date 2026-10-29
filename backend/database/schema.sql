-- 1. Tabla de estados de usuario
CREATE TABLE IF NOT EXISTS userStatus (
        idStatus INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
);

-- 2. Insertamos los estados permitidos
INSERT OR IGNORE INTO userStatus (name) VALUES
        ('PENDINGFORAPPROBATION'),
        ('PENDINGFORPASSWORDCHANGE'),
        ('ACTIVE'),
        ('REJECTED'),
        ('INACTIVE');

-- 3. Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
        idRole INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
);

INSERT OR IGNORE INTO roles (name) VALUES
        ('NONE'),
        ('MEMBER'),
        ('CLUB_ADMIN'),
        ('SUPER_ADMIN');

-- 4. Tabla de usuarios referenciando id_role e id_status
CREATE TABLE IF NOT EXISTS users (
        idUser INTEGER PRIMARY KEY AUTOINCREMENT,
        idRole INTEGER  NOT NULL DEFAULT 1,  -- * Por defecto el ID 1 es 'NONE'
        idStatus INTEGER NOT NULL DEFAULT 1, -- * Por defecto el ID 1 es 'PENDINGFORAPPROBATION'
        name TEXT NOT NULL,
        surname TEXT NOT NULL,
        dni TEXT NOT NULL UNIQUE,
        birthdate TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        password TEXT NULL,
        sessionKey TEXT NULL DEFAULT 'NONE',   -- Campo sessionKey para el token de sesión, POR DEFECTO NONE
        creationDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (idRole) REFERENCES roles(idRole) ON DELETE RESTRICT ON UPDATE CASCADE,
        FOREIGN KEY (idStatus) REFERENCES userStatus(idStatus) ON DELETE RESTRICT ON UPDATE CASCADE
);


-- TABLA DE ACTIVIDADES
CREATE TABLE IF NOT EXISTS activities (
        idActivity INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        startDate TEXT,
        endDate TEXT,
        instructor TEXT,
        capacity INTEGER,
        scope TEXT,
        status TEXT DEFAULT 'ACTIVE'
);

-- TABLA DE HORARIOS (permite múltiples horarios por actividad)
CREATE TABLE IF NOT EXISTS activitySchedules (
        idSchedule INTEGER PRIMARY KEY AUTOINCREMENT,
        idActivity INTEGER NOT NULL,
        day TEXT NOT NULL,  
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        
        -- Esto evita que una actividad tenga el mismo día y hora duplicado
        UNIQUE(idActivity, day, startTime, endTime), 
        
        FOREIGN KEY (idActivity) REFERENCES activities(idActivity) ON DELETE CASCADE
);

-- TABLA DE INSCRIPCIONES
CREATE TABLE IF NOT EXISTS activityRegistrations (
        idRegistration INTEGER PRIMARY KEY AUTOINCREMENT,
        idUser INTEGER NOT NULL,
        idActivity INTEGER NOT NULL,
        registrationDate TEXT DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'ACTIVE',
        UNIQUE(idUser, idActivity), -- Evita doble inscripción
        
        FOREIGN KEY (idUser) REFERENCES users(idUser) ON DELETE CASCADE,
        FOREIGN KEY (idActivity) REFERENCES activities(idActivity) ON DELETE CASCADE
);