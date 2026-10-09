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
('MEMBER'),
('CLUB_ADMIN'),
('SUPER_ADMIN');

-- 4. Tabla de usuarios referenciando id_role e id_status
CREATE TABLE IF NOT EXISTS users (
    idUser INTEGER PRIMARY KEY AUTOINCREMENT,
    idRole INTEGER NULL,
    idStatus INTEGER NOT NULL DEFAULT 1, -- * Por defecto el ID 1 es 'PENDINGFORAPPROBATION'
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    dni TEXT NOT NULL UNIQUE,
    birthdate TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    password TEXT NULL,
    creationDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (idRole) REFERENCES roles(idRole) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (idStatus) REFERENCES userStatus(idStatus) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- TIENE QUE CAMBIAR LA CONTRASEÑA
INSERT OR IGNORE INTO users (idRole, idStatus, name, surname, dni, birthdate, email, phone, password )
VALUES (1, 2, 'Carlos', 'Tevez', '123', '1984-02-05', 'carlitos@email.com', '1123456789', '123');

-- NO TIENE QUE CAMBIAR LA CONTRASEÑA
INSERT OR IGNORE INTO users (idRole, idStatus, name, surname, dni, birthdate, email, phone, password )
VALUES (1, 3, 'Vero', 'Papp', '1234', '1945-07-05', 'verito@email.com', '11456789', '1234');

-- NO ESTA ACTIVO
INSERT OR IGNORE INTO users (idRole, idStatus, name, surname, dni, birthdate, email, phone, password )
VALUES (1, 4, 'Seba', 'asdd', '12345', '1999-09-09', 'seba@email.com', '1125689', '12345');
