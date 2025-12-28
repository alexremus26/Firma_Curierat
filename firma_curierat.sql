CREATE TABLE PRODUS -------------
(
    id_produs      INT PRIMARY KEY,
    nume_produs    VARCHAR(30) NOT NULL,
    nume_categorie VARCHAR(30) NOT NULL,
    valoare_ron    DECIMAL(6, 2) NOT NULL,
    fragilitate   VARCHAR(10) NOT NULL
);

CREATE TABLE LOCATIE(
    id_locatie INT PRIMARY KEY,
    cod_postal VARCHAR(6) UNIQUE,
    judet VARCHAR(15) NOT NULL,
    localitate VARCHAR(30) NOT NULL,
    strada VARCHAR(40) NOT NULL
);

ALTER TABLE LOCATIE
    ADD CONSTRAINT CK_locatie_cod_postal CHECK (LENGTH(cod_postal) = 6);

CREATE TABLE DEPOZIT(
  id_depozit INT PRIMARY KEY,
  capacitate_maxima DECIMAL NOT NULL
);

ALTER TABLE DEPOZIT
    ADD (id_locatie INT DEFAULT 1 NOT NULL)
    ADD CONSTRAINT FK_depozit_locatie
        FOREIGN KEY (id_locatie) REFERENCES LOCATIE(id_locatie)
            ON DELETE CASCADE;

CREATE TABLE EXPEDITOR(
    id_expeditor INT PRIMARY KEY,
    tip_expeditor VARCHAR(20) NOT NULL,
    nume VARCHAR(20) NOT NULL,
    prenume VARCHAR(40) NOT NULL,
    telefon VARCHAR(10) NOT NULL,
    email VARCHAR(35) UNIQUE,
    adresa VARCHAR(50) NOT NULL
);

ALTER TABLE EXPEDITOR
    ADD (CONSTRAINT CK_expeditor_email CHECK (email LIKE '%@%.%'))
    ADD CONSTRAINT CK_expeditor_telefon CHECK (LENGTH(telefon) = 10);

