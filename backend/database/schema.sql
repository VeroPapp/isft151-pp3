-- 1. Tabla de estados de usuario
CREATE TABLE IF NOT EXISTS user_status (
    id_status INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- 2. Insertamos los estados permitidos
INSERT OR IGNORE INTO user_status (name) VALUES
('PENDING'),
('ACTIVE'),
('REJECTED'),
('INACTIVE');

-- 3. Tabla de roles
CREATE TABLE IF NOT EXISTS role (
    id_role INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

INSERT OR IGNORE INTO role (name) VALUES
('MEMBER'),
('CLUB_ADMIN'),
('SUPER_ADMIN');

-- 4. Tabla de usuarios referenciando id_role e id_status
CREATE TABLE IF NOT EXISTS users (
    id_user INTEGER PRIMARY KEY AUTOINCREMENT,
    id_role INTEGER NULL,
    id_status INTEGER NOT NULL DEFAULT 1, -- * Por defecto el ID 1 es 'PENDING'
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    dni TEXT NOT NULL UNIQUE,
    birthdate TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    password TEXT NULL,
    temporary_password INTEGER NOT NULL DEFAULT 0,
    creation_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_role) REFERENCES role(id_role) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_status) REFERENCES user_status(id_status) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- INSERT INTO users (id_role, id_status, name, surname, dni, birthdate, email, phone, password)
-- VALUES (1, 2, 'Carlos', 'Tevez', '34123456', '1984-02-05', 'carlitos@email.com', '1123456789', 'hash_password_aqui');


-- INSERT INTO users (id_role, name, surname, dni, birthdate, email, phone, password)
-- VALUES (1, 'Juana', 'Molina', '40987654', '1998-10-15', 'juana@email.com', '2235998877', 'hash_password_aqui');


-- INSERT INTO users (id_role, id_status, name, surname, dni, birthdate, email, phone, password)
-- VALUES (2, 2, 'Ana', 'Sosa', '32456123', '1982-07-22', 'ana.admin@email.com', '2234556677', 'hash_password_aqui');
