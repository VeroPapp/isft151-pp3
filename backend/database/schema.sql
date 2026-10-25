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

-- 3. Tabla de roles,(con 'NONE' incluido)
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

-- TIENE QUE CAMBIAR LA CONTRASEÑA (Carlos / password: "123")
INSERT OR IGNORE INTO users (idRole, idStatus, name, surname, dni, birthdate, email, phone, password)
VALUES (2, 2, 'Carlos', 'Tevez', '123', '1984-02-05', 'carlitos@email.com', '1123456789',
        'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3');

-- NO TIENE QUE CAMBIAR LA CONTRASEÑA (Vero / password: "1234")
INSERT OR IGNORE INTO users (idRole, idStatus, name, surname, dni, birthdate, email, phone, password)
VALUES (2, 3, 'Vero', 'Papp', '1234', '1945-07-05', 'verito@email.com', '11456789',
        '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4');

-- NO ESTA ACTIVO (Seba / password: "12345")
INSERT OR IGNORE INTO users (idRole, idStatus, name, surname, dni, birthdate, email, phone, password)
VALUES (2, 4, 'Seba', 'asdd', '12345', '1999-09-09', 'seba@email.com', '1125689',
        '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5');

-- ADMIN DE CLUB (adminClub / password: "123456")
INSERT OR IGNORE INTO users (idRole, idStatus, name, surname, dni, birthdate, email, phone, password)
VALUES (3, 3, 'adminClub', 'asdd', '123456', '1999-09-09', 'adminclub@email.com', '1125689',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92');


-- TABLA DE ACTIVIDADES

CREATE TABLE IF NOT EXISTS activities (
        idActivity INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        startDate TEXT, 
        endDate TEXt,
        instructor TEXT,
        capacity INTEGER NOT NULL,
        trainingDays TEXT,
        trainingTime TEXT,
        scope TEXT,
        status TEXT DEFAULT 'ACTIVE'
);

-- TABLA DE INSCRIPCIONES

CREATE TABLE IF NOT EXISTS activity_registration (
        idRegistration INTEGER PRIMARY KEY AUTOINCREMENT,
        idUser INTEGER NOT NULL,
        idActivity INTEGER NOT NULL,
        registrationDate TEXT DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'ACTIVE',
        FOREIGN KEY (idUser) REFERENCES users(idUser),
        FOREIGN KEY (idActivity) REFERENCES activities(idActivity)
);