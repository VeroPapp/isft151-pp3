-- ==========================================
-- USUARIOS DE PRUEBA
-- ==========================================

-- TIENE QUE CAMBIAR LA CONTRASEÑA (Carlos / password: "123")
INSERT OR IGNORE INTO users (idRole, idStatus, name, surname, dni, birthdate, email, phone, password)
VALUES (2, 2, 'Carlos', 'Tevez', '123', '1984-02-05', 'carlitos@email.com', '1123456789',
        'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3');

-- NO TIENE QUE CAMBIAR LA CONTRASEÑA (Vero / password: "1234")
INSERT OR IGNORE INTO users (idRole, idStatus, name, surname, dni, birthdate, email, phone, password)
VALUES (2, 3, 'Vero', 'Papp', '1234', '1945-07-05', 'verito@email.com', '11456789',
        '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4');

-- ADMIN DE CLUB (adminClub / password: "123456")
INSERT OR IGNORE INTO users (idRole, idStatus, name, surname, dni, birthdate, email, phone, password)
VALUES (3, 3, 'adminClub', 'asdd', '123456', '1999-09-09', 'adminclub@email.com', '1125689',
        '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92');


-- ==========================================
-- SOLICITUDES DE MEMBRESÍA PENDIENTES
-- ==========================================

-- 1. Solicitud de Juan Perez (DNI: 11111111 / Contraseña: 11111111)
INSERT OR IGNORE INTO users (idRole, idStatus, name, surname, dni, birthdate, email, phone, password)
VALUES (1, 1, 'Juan', 'Perez', '11111111', '1990-05-12', 'juan.perez@email.com', '1122334455',
        'bcb15f821479b4d5772b1fecb8fba0a4a6b6a029914f8b02d2e061638d6c8b39');

-- 2. Solicitud de Maria Gomez (DNI: 22222222 / Contraseña: 22222222)
INSERT OR IGNORE INTO users (idRole, idStatus, name, surname, dni, birthdate, email, phone, password)
VALUES (1, 1, 'Maria', 'Gomez', '22222222', '1985-11-20', 'maria.gomez@email.com', '1155667788',
        '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f');

-- 3. Solicitud de Pedro Lopez (DNI: 33333333 / Contraseña: 33333333)
INSERT OR IGNORE INTO users (idRole, idStatus, name, surname, dni, birthdate, email, phone, password)
VALUES (1, 1, 'Pedro', 'Lopez', '33333333', '1998-02-14', 'pedro.lopez@email.com', '1199887766',
        '9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p3q2r1s0t9u8v7w6x5y4z3a2b1c0d9e8f');


-- ==========================================
-- ACTIVIDADES DE PRUEBA Y SUS HORARIOS
-- ==========================================

-- 1. Fútbol (2 horarios)
INSERT OR IGNORE INTO activities (name, description, startDate, endDate, instructor, capacity, scope) 
VALUES ('Fútbol', 'Para chicos de 6 a 12 años. Iniciación deportiva, trabajo en equipo y diversión.', '2026-03-01', '2026-12-15', 'Martín', 20, 'Solo Socios');

INSERT OR IGNORE INTO activitySchedules (idActivity, day, startTime, endTime) 
SELECT idActivity, 'Martes', '10:00', '12:00' FROM activities WHERE name = 'Fútbol';

INSERT OR IGNORE INTO activitySchedules (idActivity, day, startTime, endTime) 
SELECT idActivity, 'Jueves', '15:00', '16:00' FROM activities WHERE name = 'Fútbol';

-- 2. Básquet (1 horario)
INSERT OR IGNORE INTO activities (name, description, startDate, endDate, instructor, capacity, scope) 
VALUES ('Básquet', 'Para adolescentes y adultos (mayores de 15 años). Nivel intermedio, se juegan partidos amistosos.', '2026-03-01', '2026-12-15', 'Laura', 15, 'Solo Socios');

INSERT OR IGNORE INTO activitySchedules (idActivity, day, startTime, endTime) 
SELECT idActivity, 'Lunes', '18:00', '20:00' FROM activities WHERE name = 'Básquet';

-- 3. Yoga (2 horarios)
INSERT OR IGNORE INTO activities (name, description, startDate, endDate, instructor, capacity, scope) 
VALUES ('Yoga', 'Para todas las edades (adultos). Clases de relajación y estiramiento, ideal para principiantes.', '2026-03-01', '2026-12-15', 'Carolina', 30, 'Solo Socios');

INSERT OR IGNORE INTO activitySchedules (idActivity, day, startTime, endTime) 
SELECT idActivity, 'Miércoles', '09:00', '10:30' FROM activities WHERE name = 'Yoga';

INSERT OR IGNORE INTO activitySchedules (idActivity, day, startTime, endTime) 
SELECT idActivity, 'Viernes', '09:00', '10:30' FROM activities WHERE name = 'Yoga';

-- 4. Natación (1 horario)
INSERT OR IGNORE INTO activities (name, description, startDate, endDate, instructor, capacity, scope) 
VALUES ('Natación', 'Para niños y jóvenes (de 8 a 18 años). Clases de iniciación y perfeccionamiento en el agua.', '2026-03-01', '2026-12-15', 'Sofía', 12, 'Solo Socios');

INSERT OR IGNORE INTO activitySchedules (idActivity, day, startTime, endTime) 
SELECT idActivity, 'Sábado', '10:00', '12:00' FROM activities WHERE name = 'Natación';