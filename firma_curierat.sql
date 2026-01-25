CREATE TABLE LOCATIE (
                         id_locatie INT PRIMARY KEY,
                         cod_postal VARCHAR(6) UNIQUE,
                         judet VARCHAR(15) NOT NULL,
                         localitate VARCHAR(30) NOT NULL,
                         strada VARCHAR(40) NOT NULL
);

ALTER TABLE LOCATIE
    ADD CONSTRAINT CK_locatie_cod_postal CHECK (LENGTH(cod_postal) = 6);


CREATE TABLE DEPOZIT (
                         id_depozit INT PRIMARY KEY,
                         capacitate_maxima DECIMAL(10, 2) NOT NULL,
                         id_locatie INT NOT NULL
);

ALTER TABLE DEPOZIT
    ADD (
        CONSTRAINT FK_depozit_locatie FOREIGN KEY (id_locatie)
            REFERENCES LOCATIE(id_locatie) ON DELETE CASCADE,
        CONSTRAINT CK_depozit_capacitate CHECK (capacitate_maxima > 0)
        );


CREATE TABLE EXPEDITOR (
                           id_expeditor INT PRIMARY KEY,
                           tip_expeditor VARCHAR(20) NOT NULL,
                           nume VARCHAR(30) NOT NULL,
                           prenume VARCHAR(30) NOT NULL,
                           telefon VARCHAR(10) NOT NULL,
                           email VARCHAR(50) UNIQUE,
                           adresa VARCHAR(100) NOT NULL
);

ALTER TABLE EXPEDITOR
    ADD (
        CONSTRAINT CK_expeditor_email CHECK (email LIKE '%@%.%'),
        CONSTRAINT CK_expeditor_telefon CHECK (LENGTH(telefon) = 10)
        );


CREATE TABLE COLET (
                       awb VARCHAR(20) PRIMARY KEY,
                       status VARCHAR(20) NOT NULL,
                       data_preluare DATE DEFAULT SYSDATE,
                       destinatar_nume VARCHAR(30) NOT NULL,
                       destinatar_prenume VARCHAR(30) NOT NULL,
                       destinatar_adresa VARCHAR(100) NOT NULL,
                       greutate DECIMAL(6, 2),
                       dimensiune VARCHAR(20),
                       valoare_ron DECIMAL(10, 2),
                       id_expeditor INT NOT NULL,
                       id_depozit INT
);

ALTER TABLE COLET
    ADD (
        CONSTRAINT ck_colet_status CHECK (status IN ('In Depozit', 'In Tranzit', 'Livrat')),
        CONSTRAINT FK_colet_expeditor FOREIGN KEY (id_expeditor)
            REFERENCES EXPEDITOR(id_expeditor) ON DELETE CASCADE,
        CONSTRAINT FK_colet_depozit FOREIGN KEY (id_depozit)
            REFERENCES DEPOZIT(id_depozit) ON DELETE SET NULL,
        CONSTRAINT CK_colet_greutate CHECK (greutate > 0),
        CONSTRAINT CK_colet_valoare CHECK (valoare_ron >= 0)
        );


CREATE TABLE PRODUS (
                        id_produs INT PRIMARY KEY,
                        nume_produs VARCHAR(50) NOT NULL,
                        nume_categorie VARCHAR(30) NOT NULL,
                        fragilitate VARCHAR(2) NOT NULL
);


CREATE TABLE LIVRATOR (
                          id_livrator INT PRIMARY KEY,
                          nume VARCHAR(30) NOT NULL,
                          prenume VARCHAR(30) NOT NULL,
                          salariu DECIMAL(10, 2) NOT NULL
);

ALTER TABLE LIVRATOR
    ADD CONSTRAINT CK_livrator_salariu CHECK (salariu > 0);


CREATE TABLE VEHICUL (
                         nr_inmatriculare VARCHAR(7) PRIMARY KEY,
                         model VARCHAR(20) NOT NULL,
                         marca VARCHAR(20) NOT NULL,
                         capacitate_dimensiune DECIMAL(10, 2),
                         capacitate_greutate DECIMAL(10, 2)
);

ALTER TABLE VEHICUL
    ADD (
        CONSTRAINT CK_vehicul_inmatriculare CHECK (LENGTH(nr_inmatriculare) = 7),
        CONSTRAINT CK_vehicul_cap_dim CHECK (capacitate_dimensiune > 0),
        CONSTRAINT CK_vehicul_cap_greutate CHECK (capacitate_greutate > 0)
        );



CREATE TABLE CONTINUT_COLET
(
    awb       VARCHAR(20),
    id_produs INT,
    cantitate INT DEFAULT 1 NOT NULL,
    CONSTRAINT PK_continut_colet PRIMARY KEY (awb, id_produs),
    CONSTRAINT FK_cc_colet FOREIGN KEY (awb) REFERENCES COLET (awb) ON DELETE CASCADE,
    CONSTRAINT FK_cc_produs FOREIGN KEY (id_produs) REFERENCES PRODUS (id_produs) ON DELETE CASCADE,
    CONSTRAINT CK_continut_cantitate CHECK (cantitate > 0)
);


CREATE TABLE LIVRARE_COLET
(
    awb          VARCHAR(20),
    id_livrator  INT,
    data_livrare TIMESTAMP,
    CONSTRAINT PK_livrare_colet PRIMARY KEY (awb, id_livrator),
    CONSTRAINT FK_lc_colet FOREIGN KEY (awb) REFERENCES COLET (awb) ON DELETE CASCADE,
    CONSTRAINT FK_lc_livrator FOREIGN KEY (id_livrator) REFERENCES LIVRATOR (id_livrator) ON DELETE CASCADE
);


CREATE TABLE ALOCARE_VEHICUL
(
    id_livrator      INT,
    nr_inmatriculare VARCHAR(7),
    data_alocare     DATE DEFAULT SYSDATE,
    CONSTRAINT PK_alocare_vehicul PRIMARY KEY (id_livrator, nr_inmatriculare, data_alocare),
    CONSTRAINT FK_av_livrator FOREIGN KEY (id_livrator) REFERENCES LIVRATOR (id_livrator) ON DELETE CASCADE,
    CONSTRAINT FK_av_vehicul FOREIGN KEY (nr_inmatriculare) REFERENCES VEHICUL (nr_inmatriculare) ON DELETE CASCADE
);

-- LOCATIE

INSERT INTO LOCATIE VALUES (1, '010011', 'Bucuresti', 'Sector 1', 'Calea Victoriei 12');
INSERT INTO LOCATIE VALUES (2, '400001', 'Cluj', 'Cluj-Napoca', 'Strada Universitatii 5');
INSERT INTO LOCATIE VALUES (3, '300001', 'Timis', 'Timisoara', 'Bulevardul Revolutiei 10');
INSERT INTO LOCATIE VALUES (4, '700001', 'Iasi', 'Iasi', 'Strada Cuza Voda 2');
INSERT INTO LOCATIE VALUES (5, '900001', 'Constanta', 'Constanta', 'Bulevardul Tomis 45');
INSERT INTO LOCATIE VALUES (6, '200690', 'Dolj', 'Craiova', 'Calea Bucuresti 100');
INSERT INTO LOCATIE VALUES (7, '500321', 'Brasov', 'Brasov', 'Strada Republicii 8');
INSERT INTO LOCATIE VALUES (8, '410067', 'Bihor', 'Oradea', 'Strada Primariei 22');
INSERT INTO LOCATIE VALUES (9, '810123', 'Braila', 'Braila', 'Calea Calarasilor 5');
INSERT INTO LOCATIE VALUES (10, '330104', 'Hunedoara', 'Deva', 'Bulevardul Decebal 1');
INSERT INTO LOCATIE VALUES (11, '100023', 'Prahova', 'Ploiesti', 'Strada Grivitei 14');
INSERT INTO LOCATIE VALUES (12, '600120', 'Bacau', 'Bacau', 'Strada Energiei 3');
INSERT INTO LOCATIE VALUES (13, '430210', 'Maramures', 'Baia Mare', 'Bulevardul Unirii 9');
INSERT INTO LOCATIE VALUES (14, '550100', 'Sibiu', 'Sibiu', 'Calea Dumbravii 20');
INSERT INTO LOCATIE VALUES (15, '240120', 'Valcea', 'Ramnicu Valcea', 'Strada Carol I 2');

-- DEPOZIT

INSERT INTO DEPOZIT VALUES (10, 15000.00, 1);
INSERT INTO DEPOZIT VALUES (20, 8000.00, 2);
INSERT INTO DEPOZIT VALUES (30, 9500.00, 3);
INSERT INTO DEPOZIT VALUES (40, 7000.00, 4);
INSERT INTO DEPOZIT VALUES (50, 6500.00, 6);
INSERT INTO DEPOZIT VALUES (60, 12000.00, 7);
INSERT INTO DEPOZIT VALUES (70, 5000.00, 11);
INSERT INTO DEPOZIT VALUES (80, 4500.00, 14);
INSERT INTO DEPOZIT VALUES (90, 3000.00, 15);
INSERT INTO DEPOZIT VALUES (100, 4000.00, 5);

-- EXPEDITOR

INSERT INTO EXPEDITOR VALUES (1, 'Persoana Fizica', 'Popescu', 'Ion', '0722111222', 'ion.popescu@gmail.com', 'Str. Veseliei 4, Bucuresti');
INSERT INTO EXPEDITOR VALUES (2, 'Persoana Juridica', 'eMAG', 'Depozit', '0733444555', 'contact@emag.ro', 'Soseaua Virtutii 100, Bucuresti');
INSERT INTO EXPEDITOR VALUES (3, 'Persoana Fizica', 'Georgescu', 'Ana', '0744999888', 'ana.geo@yahoo.com', 'Str. Lunga 12, Brasov');
INSERT INTO EXPEDITOR VALUES (4, 'Persoana Juridica', 'FashionDays', 'Logistica', '0755111333', 'office@fashiondays.ro', 'Bd. Metalurgiei 2, Ilfov');
INSERT INTO EXPEDITOR VALUES (5, 'Persoana Fizica', 'Mihailescu', 'Dan', '0766222444', 'dan.mihai@outlook.com', 'Str. Primariei 1, Oradea');
INSERT INTO EXPEDITOR VALUES (6, 'Persoana Juridica', 'PC Garage', 'Vanzari', '0711999111', 'logistica@pcgarage.ro', 'Str. Logofat Tautu 6, Bucuresti');
INSERT INTO EXPEDITOR VALUES (7, 'Persoana Fizica', 'Ionescu', 'Elena', '0722000333', 'elena.io@email.com', 'Str. Florilor 9, Cluj');
INSERT INTO EXPEDITOR VALUES (8, 'Persoana Juridica', 'Dedeman', 'Suport', '0733555222', 'contact@dedeman.ro', 'Str. Tolstoian 4, Bacau');
INSERT INTO EXPEDITOR VALUES (9, 'Persoana Fizica', 'Stoica', 'Andrei', '0744111777', 'stoica.andrei@info.ro', 'Str. Marasesti 20, Ploiesti');
INSERT INTO EXPEDITOR VALUES (10, 'Persoana Juridica', 'Libris', 'Depozit', '0755444999', 'expediti@libris.ro', 'Str. Muresenilor 1, Brasov');

-- PRODUS

INSERT INTO PRODUS VALUES (100, 'Smartphone Galaxy', 'Electronice', 'DA');
INSERT INTO PRODUS VALUES (101, 'Laptop Gaming', 'Electronice', 'DA');
INSERT INTO PRODUS VALUES (102, 'Casti Wireless', 'Audio', 'NU');
INSERT INTO PRODUS VALUES (103, 'Monitor 4K', 'Periferice', 'DA');
INSERT INTO PRODUS VALUES (104, 'Tastatura Mecanica', 'Periferice', 'NU');
INSERT INTO PRODUS VALUES (105, 'Mouse Optic', 'Periferice', 'NU');
INSERT INTO PRODUS VALUES (106, 'Rochie de Seara', 'Haine', 'NU');
INSERT INTO PRODUS VALUES (107, 'Pantofi Sport', 'Incaltaminte', 'NU');
INSERT INTO PRODUS VALUES (108, 'Set Farfurii Portelan', 'Home', 'DA');
INSERT INTO PRODUS VALUES (109, 'Bormasina Electrica', 'Scule', 'NU');
INSERT INTO PRODUS VALUES (110, 'Roman - Arta Razboiului', 'Carti', 'NU');
INSERT INTO PRODUS VALUES (111, 'Enciclopedie Copii', 'Carti', 'NU');

-- VEHICUL

INSERT INTO VEHICUL VALUES ('B100ABC', 'Sprinter', 'Mercedes', 15.0, 1500.0);
INSERT INTO VEHICUL VALUES ('B200DEF', 'Vito', 'Mercedes', 8.0, 900.0);
INSERT INTO VEHICUL VALUES ('CJ50XYZ', 'Transit', 'Ford', 12.0, 1200.0);
INSERT INTO VEHICUL VALUES ('TM10TRK', 'Master', 'Renault', 18.0, 2000.0);
INSERT INTO VEHICUL VALUES ('IS22DLV', 'Daily', 'Iveco', 16.0, 1800.0);
INSERT INTO VEHICUL VALUES ('CT88CUR', 'Caddy', 'VW', 4.0, 500.0);
INSERT INTO VEHICUL VALUES ('BV07KGO', 'Crafter', 'VW', 14.0, 1600.0);
INSERT INTO VEHICUL VALUES ('PH44FST', 'Boxer', 'Peugeot', 11.0, 1100.0);
INSERT INTO VEHICUL VALUES ('SB01SLV', 'Ducato', 'Fiat', 13.0, 1400.0);
INSERT INTO VEHICUL VALUES ('BR07CAA', 'Hatchback', 'Opel', 4.0, 500.0);

-- LIVRATOR

INSERT INTO LIVRATOR VALUES (1, 'Visan', 'Miruna', 4500.00);
INSERT INTO LIVRATOR VALUES (2, 'Constantin', 'Marius', 4200.00);
INSERT INTO LIVRATOR VALUES (3, 'Stancu', 'Victor', 4300.00);
INSERT INTO LIVRATOR VALUES (4, 'Radu', 'Cristian', 4600.00);
INSERT INTO LIVRATOR VALUES (5, 'Munteanu', 'Gabriel', 4100.00);
INSERT INTO LIVRATOR VALUES (6, 'Filip', 'Andreea', 4700.00);
INSERT INTO LIVRATOR VALUES (7, 'Dobre', 'Robert', 4400.00);
INSERT INTO LIVRATOR VALUES (8, 'Vasile', 'Cosmin', 4250.00);
INSERT INTO LIVRATOR VALUES (9, 'Iacob', 'Daniel', 4350.00);
INSERT INTO LIVRATOR VALUES (10, 'Stoicescu', 'Remus', 5450.00);

-- COLET

INSERT INTO COLET VALUES ('AWB1001', 'In Tranzit', SYSDATE-10, 'Marinescu', 'Elena', 'Str. Rozelor 5, Timis', 2.5, 'S', 3200.00, 1, 10);
INSERT INTO COLET VALUES ('AWB1002', 'In Tranzit', SYSDATE-2, 'Nistor', 'Paul', 'Bd. Unirii 12, Cluj', 5.0, 'M', 6500.00, 2, NULL);
INSERT INTO COLET VALUES ('AWB1003', 'Livrat', SYSDATE-25, 'Lupu', 'Maria', 'Str. Libertatii 1, Iasi', 0.8, 'S', 450.00, 3, 40);
INSERT INTO COLET VALUES ('AWB1004', 'In Tranzit', SYSDATE-1, 'Dina', 'George', 'Calea Bucuresti 2, Craiova', 12.0, 'XL', 1800.00, 4, 50);
INSERT INTO COLET VALUES ('AWB1005', 'In Tranzit', SYSDATE-3, 'Albu', 'Simona', 'Str. Grivitei 4, Ploiesti', 1.2, 'M', 350.00, 6, NULL);
INSERT INTO COLET VALUES ('AWB1006', 'In Depozit', SYSDATE-1, 'Matei', 'Ionut', 'Bd. Tomis 20, Constanta', 0.5, 'S', 150.00, 1, 30);
INSERT INTO COLET VALUES ('AWB1007', 'Livrat', SYSDATE-15, 'Voicu', 'Rares', 'Str. Muresenilor 5, Brasov', 3.0, 'M', 600.00, 4, 60);
INSERT INTO COLET VALUES ('AWB1008', 'Livrat', SYSDATE-8, 'Baciu', 'Andrada', 'Str. Primariei 10, Oradea', 2.0, 'L', 300.00, 7, 20);
INSERT INTO COLET VALUES ('AWB1009', 'In Depozit', SYSDATE-2, 'Miron', 'Vasile', 'Str. Victoriei 1, Bacau', 4.5, 'L', 250.00, 8, 80);
INSERT INTO COLET VALUES ('AWB1010', 'In Tranzit', SYSDATE, 'Ene', 'Claudia', 'Str. Carol 8, Sibiu', 6.0, 'XL', 400.00, 2, NULL);
INSERT INTO COLET VALUES ('AWB1011', 'Livrat', SYSDATE-30, 'Pavel', 'Bogdan', 'Bd. Decebal 5, Deva', 0.3, 'S', 45.00, 10, 70);
INSERT INTO COLET VALUES ('AWB1012', 'Livrat', SYSDATE-22, 'Savu', 'Mihai', 'Str. Energiei 2, Baia Mare', 0.9, 'M', 80.00, 10, 90);
INSERT INTO COLET VALUES ('AWB1013', 'In Tranzit', SYSDATE-4, 'Stoian', 'Dan', 'Str. Garii 1, Arad', 1.5, 'M', 120.00, 5, 20);
INSERT INTO COLET VALUES ('AWB1014', 'Livrat', SYSDATE-18, 'Radu', 'Anca', 'Str. Noua 4, Buzau', 2.2, 'M', 310.00, 9, 30);
INSERT INTO COLET VALUES ('AWB1015', 'Livrat', SYSDATE-12, 'Stan', 'Igor', 'Str. Veche 2, Tulcea', 0.5, 'S', 50.00, 3, 10);
INSERT INTO COLET VALUES ('AWB1016', 'In Depozit', SYSDATE-1, 'Dobre', 'Mina', 'Str. Campului 7, Zalau', 3.4, 'L', 450.00, 1, 40);
INSERT INTO COLET VALUES ('AWB1017', 'In Tranzit', SYSDATE-5, 'Gheorghe', 'Ion', 'Str. Teilor 9, Slatina', 1.1, 'S', 90.00, 2, 50);
INSERT INTO COLET VALUES ('AWB1018', 'Livrat', SYSDATE-9, 'Enache', 'Lia', 'Str. Primaverii 3, Vaslui', 4.0, 'L', 560.00, 4, 60);
INSERT INTO COLET VALUES ('AWB1019', 'In Tranzit', SYSDATE-3, 'Nica', 'Paul', 'Str. Toamnei 11, Resita', 0.8, 'S', 210.00, 6, 70);
INSERT INTO COLET VALUES ('AWB1020', 'In Depozit', SYSDATE, 'Rus', 'Adina', 'Str. Iernii 5, Satu Mare', 5.5, 'XL', 800.00, 7, 80);

-- CONTINUT_COLET

INSERT INTO CONTINUT_COLET VALUES ('AWB1001', 100, 1);
INSERT INTO CONTINUT_COLET VALUES ('AWB1001', 102, 1);
INSERT INTO CONTINUT_COLET VALUES ('AWB1001', 103, 1);
INSERT INTO CONTINUT_COLET VALUES ('AWB1002', 101, 1);
INSERT INTO CONTINUT_COLET VALUES ('AWB1002', 103, 1);
INSERT INTO CONTINUT_COLET VALUES ('AWB1002', 104, 1);
INSERT INTO CONTINUT_COLET VALUES ('AWB1003', 102, 1);
INSERT INTO CONTINUT_COLET VALUES ('AWB1004', 103, 2);
INSERT INTO CONTINUT_COLET VALUES ('AWB1005', 104, 1);
INSERT INTO CONTINUT_COLET VALUES ('AWB1006', 105, 3);
INSERT INTO CONTINUT_COLET VALUES ('AWB1007', 106, 1);
INSERT INTO CONTINUT_COLET VALUES ('AWB1008', 107, 1);
INSERT INTO CONTINUT_COLET VALUES ('AWB1009', 108, 1);
INSERT INTO CONTINUT_COLET VALUES ('AWB1010', 109, 1);
INSERT INTO CONTINUT_COLET VALUES ('AWB1011', 110, 5);
INSERT INTO CONTINUT_COLET VALUES ('AWB1012', 111, 2);
INSERT INTO CONTINUT_COLET VALUES ('AWB1013', 100, 1);
INSERT INTO CONTINUT_COLET VALUES ('AWB1014', 102, 2);
INSERT INTO CONTINUT_COLET VALUES ('AWB1015', 104, 1);
INSERT INTO CONTINUT_COLET VALUES ('AWB1016', 106, 1);
INSERT INTO CONTINUT_COLET VALUES ('AWB1017', 108, 2);
INSERT INTO CONTINUT_COLET VALUES ('AWB1018', 110, 1);
INSERT INTO CONTINUT_COLET VALUES ('AWB1019', 101, 1);
INSERT INTO CONTINUT_COLET VALUES ('AWB1020', 103, 1);

-- LIVRARE_COLET

INSERT INTO LIVRARE_COLET VALUES ('AWB1001', 1, NULL);
INSERT INTO LIVRARE_COLET VALUES ('AWB1003', 4, SYSTIMESTAMP - INTERVAL '24' DAY);
INSERT INTO LIVRARE_COLET VALUES ('AWB1008', 7, SYSTIMESTAMP - INTERVAL '7' DAY);
INSERT INTO LIVRARE_COLET VALUES ('AWB1002', 2, NULL);
INSERT INTO LIVRARE_COLET VALUES ('AWB1004', 3, NULL);
INSERT INTO LIVRARE_COLET VALUES ('AWB1005', 5, NULL);
INSERT INTO LIVRARE_COLET VALUES ('AWB1006', 6, NULL);
INSERT INTO LIVRARE_COLET VALUES ('AWB1007', 8, SYSTIMESTAMP - INTERVAL '14' DAY);
INSERT INTO LIVRARE_COLET VALUES ('AWB1009', 9, NULL);
INSERT INTO LIVRARE_COLET VALUES ('AWB1010', 10, NULL);
INSERT INTO LIVRARE_COLET VALUES ('AWB1011', 1, SYSTIMESTAMP - INTERVAL '29' DAY);
INSERT INTO LIVRARE_COLET VALUES ('AWB1012', 2, SYSTIMESTAMP - INTERVAL '21' DAY);
INSERT INTO LIVRARE_COLET VALUES ('AWB1013', 3, NULL);
INSERT INTO LIVRARE_COLET VALUES ('AWB1014', 4, SYSTIMESTAMP - INTERVAL '17' DAY);
INSERT INTO LIVRARE_COLET VALUES ('AWB1015', 5, SYSTIMESTAMP - INTERVAL '11' DAY);
INSERT INTO LIVRARE_COLET VALUES ('AWB1016', 6, NULL);
INSERT INTO LIVRARE_COLET VALUES ('AWB1017', 7, NULL);
INSERT INTO LIVRARE_COLET VALUES ('AWB1018', 8, SYSTIMESTAMP - INTERVAL '8' DAY);
INSERT INTO LIVRARE_COLET VALUES ('AWB1019', 9, NULL);
INSERT INTO LIVRARE_COLET VALUES ('AWB1020', 10, NULL);

-- ALOCARE_VEHICUL

INSERT INTO ALOCARE_VEHICUL (id_livrator, nr_inmatriculare, data_alocare) VALUES (1, 'B100ABC', SYSDATE-15);
INSERT INTO ALOCARE_VEHICUL (id_livrator, nr_inmatriculare, data_alocare) VALUES (1, 'B100ABC', SYSDATE-10);
INSERT INTO ALOCARE_VEHICUL (id_livrator, nr_inmatriculare, data_alocare) VALUES (1, 'B100ABC', SYSDATE-2);
INSERT INTO ALOCARE_VEHICUL (id_livrator, nr_inmatriculare, data_alocare) VALUES (2, 'B200DEF', SYSDATE-12);
INSERT INTO ALOCARE_VEHICUL (id_livrator, nr_inmatriculare, data_alocare) VALUES (2, 'B200DEF', SYSDATE-5);
INSERT INTO ALOCARE_VEHICUL (id_livrator, nr_inmatriculare, data_alocare) VALUES (3, 'CJ50XYZ', SYSDATE-8);
INSERT INTO ALOCARE_VEHICUL (id_livrator, nr_inmatriculare, data_alocare) VALUES (3, 'CJ50XYZ', SYSDATE);
INSERT INTO ALOCARE_VEHICUL (id_livrator, nr_inmatriculare, data_alocare) VALUES (4, 'IS22DLV', SYSDATE-7);
INSERT INTO ALOCARE_VEHICUL (id_livrator, nr_inmatriculare, data_alocare) VALUES (5, 'TM10TRK', SYSDATE-1);
INSERT INTO ALOCARE_VEHICUL (id_livrator, nr_inmatriculare, data_alocare) VALUES (6, 'CT88CUR', SYSDATE-4);
INSERT INTO ALOCARE_VEHICUL (id_livrator, nr_inmatriculare, data_alocare) VALUES (10, 'BR07CAA', SYSDATE-9);
INSERT INTO ALOCARE_VEHICUL (id_livrator, nr_inmatriculare, data_alocare) VALUES (4, 'IS22DLV', SYSDATE-20);
INSERT INTO ALOCARE_VEHICUL (id_livrator, nr_inmatriculare, data_alocare) VALUES (5, 'TM10TRK', SYSDATE-11);
INSERT INTO ALOCARE_VEHICUL (id_livrator, nr_inmatriculare, data_alocare) VALUES (7, 'BV07KGO', SYSDATE-3);
INSERT INTO ALOCARE_VEHICUL (id_livrator, nr_inmatriculare, data_alocare) VALUES (8, 'PH44FST', SYSDATE-6);
INSERT INTO ALOCARE_VEHICUL (id_livrator, nr_inmatriculare, data_alocare) VALUES (9, 'SB01SLV', SYSDATE-14);
INSERT INTO ALOCARE_VEHICUL (id_livrator, nr_inmatriculare, data_alocare) VALUES (10, 'BR07CAA', SYSDATE-19);
INSERT INTO ALOCARE_VEHICUL (id_livrator, nr_inmatriculare, data_alocare) VALUES (1, 'TM10TRK', SYSDATE-25);
INSERT INTO ALOCARE_VEHICUL (id_livrator, nr_inmatriculare, data_alocare) VALUES (2, 'B200DEF', SYSDATE-30);
INSERT INTO ALOCARE_VEHICUL (id_livrator, nr_inmatriculare, data_alocare) VALUES (6, 'BR07CAA', SYSDATE-18);

COMMIT;

-- DELETE TABLES

ALTER TABLE DEPOZIT DROP CONSTRAINT FK_DEPOZIT_LOCATIE;
ALTER TABLE COLET DROP CONSTRAINT FK_COLET_EXPEDITOR;
ALTER TABLE COLET DROP CONSTRAINT FK_COLET_DEPOZIT;

ALTER TABLE CONTINUT_COLET DROP CONSTRAINT FK_CC_COLET;
ALTER TABLE CONTINUT_COLET DROP CONSTRAINT FK_CC_PRODUS;

ALTER TABLE LIVRARE_COLET DROP CONSTRAINT FK_LC_COLET;
ALTER TABLE LIVRARE_COLET DROP CONSTRAINT FK_LC_LIVRATOR;

ALTER TABLE ALOCARE_VEHICUL DROP CONSTRAINT FK_AV_LIVRATOR;
ALTER TABLE ALOCARE_VEHICUL DROP CONSTRAINT FK_AV_VEHICUL;

DROP TABLE CONTINUT_COLET CASCADE CONSTRAINTS;
DROP TABLE LIVRARE_COLET CASCADE CONSTRAINTS;
DROP TABLE ALOCARE_VEHICUL CASCADE CONSTRAINTS;
DROP TABLE COLET CASCADE CONSTRAINTS;
DROP TABLE PRODUS CASCADE CONSTRAINTS;
DROP TABLE EXPEDITOR CASCADE CONSTRAINTS;
DROP TABLE DEPOZIT CASCADE CONSTRAINTS;
DROP TABLE LOCATIE CASCADE CONSTRAINTS;
DROP TABLE VEHICUL CASCADE CONSTRAINTS;
DROP TABLE LIVRATOR CASCADE CONSTRAINTS;


-- c)
    SELECT
         c.awb AS "AWB",
         c.status AS "Status",
         c.valoare_ron AS "Valoare",
         l.nume || ' ' || l.prenume AS "Livrator",
         l.salariu AS "Salariu Livrator"
     FROM
         COLET c
             JOIN
         LIVRARE_COLET lc ON c.awb = lc.awb
             JOIN
         LIVRATOR l ON lc.id_livrator = l.id_livrator
     WHERE
         c.status = 'In Tranzit' AND l.salariu > 4000;


-- d)
        SELECT c.awb                                                              AS "AWB",
               c.destinatar_nume || ' ' || c.destinatar_prenume                   AS "Destinatar",
               COUNT(p.id_produs)                                                 AS "Nr_Produse",
               LISTAGG(p.nume_produs, ', ') WITHIN GROUP (ORDER BY p.nume_produs) AS "Produse"
        FROM COLET c
                 JOIN CONTINUT_COLET cc ON c.awb = cc.awb
                 JOIN PRODUS p ON cc.id_produs = p.id_produs
        GROUP BY c.awb, c.destinatar_nume, c.destinatar_prenume
        HAVING COUNT(p.id_produs) > 1;

-- f1)
CREATE OR REPLACE VIEW v_colete_expeditori AS
SELECT
    C.AWB,
    C.STATUS,
    C.DATA_PRELUARE,
    C.DESTINATAR_NUME || ' ' || C.DESTINATAR_PRENUME AS DESTINATAR,
    C.DESTINATAR_ADRESA,
    C.GREUTATE,
    C.DIMENSIUNE,
    C.VALOARE_RON,
    E.NUME || ' ' || E.PRENUME AS EXPEDITOR,
    E.TIP_EXPEDITOR,
    E.EMAIL,
    E.TELEFON,
    C.ID_EXPEDITOR,
    C.ID_DEPOZIT
FROM COLET C
         JOIN EXPEDITOR E ON C.ID_EXPEDITOR = E.ID_EXPEDITOR;


-- f2)
        CREATE OR REPLACE VIEW v_raport_depozite AS
        SELECT
            D.ID_DEPOZIT AS DEPOZIT,
            L.LOCALITATE || ', ' || L.JUDET AS LOCALITATE,
            COUNT(C.AWB) AS TOTAL_COLETE,
            NVL(SUM(C.VALOARE_RON), 0) AS VALOARE_TOTALA,
            D.CAPACITATE_MAXIMA AS CAPACITATE_M3
        FROM DEPOZIT D
                 JOIN LOCATIE L ON D.ID_LOCATIE = L.ID_LOCATIE
                 LEFT JOIN COLET C ON D.ID_DEPOZIT = C.ID_DEPOZIT AND C.STATUS = 'In Depozit'
        GROUP BY D.ID_DEPOZIT, L.LOCALITATE, L.JUDET, D.CAPACITATE_MAXIMA;

