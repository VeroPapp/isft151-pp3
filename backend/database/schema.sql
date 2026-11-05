CREATE TABLE IF NOT EXISTS userStatus (
        idStatus INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
);

INSERT OR IGNORE INTO userStatus (name) VALUES
        ('PENDINGFORAPPROBATION'),
        ('PENDINGFORPASSWORDCHANGE'),
        ('ACTIVE'),
        ('REJECTED'),
        ('INACTIVE');

CREATE TABLE IF NOT EXISTS roles (
        idRole INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
);

INSERT OR IGNORE INTO roles (name) VALUES
        ('NONE'),
        ('MEMBER'),
        ('CLUB_ADMIN'),
        ('SUPER_ADMIN');

CREATE TABLE IF NOT EXISTS users (
        idUser INTEGER PRIMARY KEY AUTOINCREMENT,
        idRole INTEGER  NOT NULL DEFAULT 1,  
        idStatus INTEGER NOT NULL DEFAULT 1, 
        previousStatus INTEGER DEFAULT NULL,
        name TEXT NOT NULL,
        surname TEXT NOT NULL,
        dni TEXT NOT NULL UNIQUE,
        birthdate TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        password TEXT NULL,
        sessionKey TEXT NULL DEFAULT 'NONE', 
        creationDate TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (idRole) REFERENCES roles(idRole) ON DELETE RESTRICT ON UPDATE CASCADE,
        FOREIGN KEY (idStatus) REFERENCES userStatus(idStatus) ON DELETE RESTRICT ON UPDATE CASCADE
);


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

CREATE TABLE IF NOT EXISTS activitySchedules (
        idSchedule INTEGER PRIMARY KEY AUTOINCREMENT,
        idActivity INTEGER NOT NULL,
        day TEXT NOT NULL,  
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        
        UNIQUE(idActivity, day, startTime, endTime), 
        
        FOREIGN KEY (idActivity) REFERENCES activities(idActivity) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activityRegistrations (
        idRegistration INTEGER PRIMARY KEY AUTOINCREMENT,
        idUser INTEGER NOT NULL,
        idActivity INTEGER NOT NULL,
        registrationDate TEXT DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'ACTIVE',
        UNIQUE(idUser, idActivity), 
        
        FOREIGN KEY (idUser) REFERENCES users(idUser) ON DELETE CASCADE,
        FOREIGN KEY (idActivity) REFERENCES activities(idActivity) ON DELETE CASCADE
);