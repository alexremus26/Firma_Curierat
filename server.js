require('dotenv').config();
const express = require('express');
const oracledb = require('oracledb');
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve HTML, CSS, JS files from 'public' folder

// Database configuration
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTION_STRING
};

// Initialize Connection Pool
async function startServer() {
  try {
    await oracledb.createPool(dbConfig);
    console.log("Connected to Oracle Database");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Database Connection Error:", err.message);
    process.exit(1);
  }
}

// GET all colete with optional sorting and filtering
app.get('/api/colete', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    let query = `SELECT AWB, STATUS, DATA_PRELUARE, DESTINATAR_NUME,
                 DESTINATAR_PRENUME, DESTINATAR_ADRESA, GREUTATE,
                 DIMENSIUNE, VALOARE_RON, ID_EXPEDITOR, ID_DEPOZIT
                 FROM COLET WHERE 1=1`;

    // Add status filter if provided
    if (req.query.status) {
      query += ` AND STATUS = '${req.query.status}'`;
    }

    // Add sorting if provided
    if (req.query.sort) {
      query += ` ORDER BY ${req.query.sort}`;
    } else {
      query += ` ORDER BY DATA_PRELUARE DESC`;
    }

    const result = await connection.execute(query, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    res.json(result.rows);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// POST new colet
app.post('/api/colete', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const { awb, status, destinatar_nume, destinatar_prenume, destinatar_adresa,
            greutate, dimensiune, valoare_ron, id_expeditor, id_depozit } = req.body;

    await connection.execute(
      `INSERT INTO COLET (AWB, STATUS, DATA_PRELUARE, DESTINATAR_NUME,
       DESTINATAR_PRENUME, DESTINATAR_ADRESA, GREUTATE, DIMENSIUNE,
       VALOARE_RON, ID_EXPEDITOR, ID_DEPOZIT)
       VALUES (:awb, :status, SYSDATE, :destinatar_nume, :destinatar_prenume,
       :destinatar_adresa, :greutate, :dimensiune, :valoare_ron,
       :id_expeditor, :id_depozit)`,
      {
        awb, status, destinatar_nume, destinatar_prenume, destinatar_adresa,
        greutate, dimensiune, valoare_ron, id_expeditor, id_depozit
      },
      { autoCommit: true }
    );

    res.json({ message: 'Colet adăugat cu succes!' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// PUT update colet status
app.put('/api/colete/:awb/status', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const { awb } = req.params;
    const { status } = req.body;

    let query = `UPDATE COLET SET STATUS = :status`;

    // If status is not 'In Depozit', unassign from depot
    if (status !== 'In Depozit') {
      query += `, ID_DEPOZIT = NULL`;
    }

    query += ` WHERE AWB = :awb`;

    await connection.execute(query, { status, awb });

    if (status === 'Livrat') {
      await connection.execute(
        `UPDATE LIVRARE_COLET SET DATA_LIVRARE = SYSTIMESTAMP WHERE AWB = :awb`,
        { awb }
      );
    }

    await connection.commit(); // Manually commit the transaction

    res.json({ message: 'Status actualizat cu succes!' });
  } catch (err) {
    console.error('Error:', err);
    if (connection) {
        try {
            await connection.rollback();
            console.log("Transaction rolled back.");
        } catch (rollbackErr) {
            console.error('Error during rollback:', rollbackErr);
        }
    }
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// DELETE colet
app.delete('/api/colete/:awb', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const { awb } = req.params;

    await connection.execute(
      `DELETE FROM COLET WHERE AWB = :awb`,
      { awb },
      { autoCommit: true }
    );

    res.json({ message: 'Colet șters cu succes!' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});


// GET all expeditori (cu sortare)
app.get('/api/expeditori', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    let query = `SELECT ID_EXPEDITOR, TIP_EXPEDITOR, NUME, PRENUME, TELEFON, EMAIL, ADRESA
       FROM EXPEDITOR`;

    if (req.query.sort) {
      query += ` ORDER BY ${req.query.sort}`;
    } else {
      query += ` ORDER BY ID_EXPEDITOR`;
    }

    const result = await connection.execute(query, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    res.json(result.rows);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// POST new expeditor
app.post('/api/expeditori', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    // Get next ID
    const idResult = await connection.execute(
      `SELECT NVL(MAX(ID_EXPEDITOR), 0) + 1 AS NEXT_ID FROM EXPEDITOR`
    );
    const nextId = idResult.rows[0][0];

    const { tip_expeditor, nume, prenume, telefon, email, adresa } = req.body;

    await connection.execute(
      `INSERT INTO EXPEDITOR (ID_EXPEDITOR, TIP_EXPEDITOR, NUME, PRENUME, TELEFON, EMAIL, ADRESA)
       VALUES (:id, :tip_expeditor, :nume, :prenume, :telefon, :email, :adresa)`,
      { id: nextId, tip_expeditor, nume, prenume, telefon, email, adresa },
      { autoCommit: true }
    );

    res.json({ message: 'Expeditor adăugat cu succes!', id: nextId });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// DELETE expeditor
app.delete('/api/expeditori/:id', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const { id } = req.params;

    await connection.execute(
      `DELETE FROM EXPEDITOR WHERE ID_EXPEDITOR = :id`,
      { id },
      { autoCommit: true }
    );

    res.json({ message: 'Expeditor șters cu succes!' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});


// GET all produse (cu sortare)
app.get('/api/produse', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    let query = `SELECT ID_PRODUS, NUME_PRODUS, NUME_CATEGORIE, FRAGILITATE
       FROM PRODUS`;

    if (req.query.sort) {
      query += ` ORDER BY ${req.query.sort}`;
    } else {
      query += ` ORDER BY ID_PRODUS`;
    }

    const result = await connection.execute(query, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    res.json(result.rows);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// POST new produs
app.post('/api/produse', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    // Get next ID
    const idResult = await connection.execute(
      `SELECT NVL(MAX(ID_PRODUS), 0) + 1 AS NEXT_ID FROM PRODUS`
    );
    const nextId = idResult.rows[0][0];

    const { nume_produs, nume_categorie, fragilitate } = req.body;

    await connection.execute(
      `INSERT INTO PRODUS (ID_PRODUS, NUME_PRODUS, NUME_CATEGORIE, FRAGILITATE)
       VALUES (:id, :nume_produs, :nume_categorie, :fragilitate)`,
      { id: nextId, nume_produs, nume_categorie, fragilitate },
      { autoCommit: true }
    );

    res.json({ message: 'Produs adăugat cu succes!', id: nextId });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// DELETE produs
app.delete('/api/produse/:id', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const { id } = req.params;

    await connection.execute(
      `DELETE FROM PRODUS WHERE ID_PRODUS = :id`,
      { id },
      { autoCommit: true }
    );

    res.json({ message: 'Produs șters cu succes!' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});


// GET all livratori with their vehicles (cu sortare)
app.get('/api/livratori', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    let query = `SELECT L.ID_LIVRATOR, L.NUME, L.PRENUME, L.SALARIU,
              (SELECT LISTAGG(AV.NR_INMATRICULARE, ',')
                      WITHIN GROUP (ORDER BY AV.NR_INMATRICULARE)
               FROM ALOCARE_VEHICUL AV
               WHERE AV.ID_LIVRATOR = L.ID_LIVRATOR) AS VEHICUL
       FROM LIVRATOR L`;

    if (req.query.sort) {
      query += ` ORDER BY ${req.query.sort}`;
    } else {
      query += ` ORDER BY L.ID_LIVRATOR`;
    }

    const result = await connection.execute(query, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    res.json(result.rows);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// PUT update salariu livrator
app.put('/api/livratori/:id/salariu', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const { id } = req.params;
    const { salariu } = req.body;

    await connection.execute(
      `UPDATE LIVRATOR SET SALARIU = :salariu WHERE ID_LIVRATOR = :id`,
      { salariu, id },
      { autoCommit: true }
    );

    res.json({ message: 'Salariu actualizat cu succes!' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});


// GET all depozite with location info (cu sortare)
app.get('/api/depozite', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    let query = `SELECT D.ID_DEPOZIT, D.CAPACITATE_MAXIMA,
              L.LOCALITATE, L.JUDET, L.STRADA, L.COD_POSTAL
       FROM DEPOZIT D
       JOIN LOCATIE L ON D.ID_LOCATIE = L.ID_LOCATIE`;

    if (req.query.sort) {
      query += ` ORDER BY ${req.query.sort}`;
    } else {
      query += ` ORDER BY D.ID_DEPOZIT`;
    }

    const result = await connection.execute(query, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    res.json(result.rows);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// PUT update capacitate depozit
app.put('/api/depozite/:id/capacitate', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const { id } = req.params;
    const { capacitate } = req.body;

    await connection.execute(
      `UPDATE DEPOZIT SET CAPACITATE_MAXIMA = :capacitate WHERE ID_DEPOZIT = :id`,
      { capacitate, id },
      { autoCommit: true }
    );

    res.json({ message: 'Capacitate actualizată cu succes!' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});


// GET all vehicule (cu sortare)
app.get('/api/vehicule', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    let query = `SELECT NR_INMATRICULARE, MARCA, MODEL, CAPACITATE_DIMENSIUNE, CAPACITATE_GREUTATE
                 FROM VEHICUL`;

    if (req.query.sort) {
      query += ` ORDER BY ${req.query.sort}`;
    } else {
      query += ` ORDER BY NR_INMATRICULARE`;
    }

    const result = await connection.execute(query, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    res.json(result.rows);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// DELETE vehicul
app.delete('/api/vehicule/:nr', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const { nr } = req.params;

    await connection.execute(
      `DELETE FROM VEHICUL WHERE NR_INMATRICULARE = :nr`,
      { nr },
      { autoCommit: true }
    );

    res.json({ message: 'Vehicul șters cu succes!' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});


// GET all locatii (cu sortare)
app.get('/api/locatii', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    let query = `SELECT ID_LOCATIE, COD_POSTAL, JUDET, LOCALITATE, STRADA
                 FROM LOCATIE`;

    if (req.query.sort) {
      query += ` ORDER BY ${req.query.sort}`;
    } else {
      query += ` ORDER BY ID_LOCATIE`;
    }

    const result = await connection.execute(query, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    res.json(result.rows);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// DELETE locatie (demonstrează ON DELETE CASCADE)
app.delete('/api/locatii/:id', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const { id } = req.params;

    await connection.execute(
      `DELETE FROM LOCATIE WHERE ID_LOCATIE = :id`,
      { id },
      { autoCommit: true }
    );

    res.json({ message: 'Locație ștearsă cu succes! (Depozitele asociate au fost șterse automat - CASCADE)' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

app.get('/api/continut-colete', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        let query = `SELECT AWB, ID_PRODUS, CANTITATE FROM CONTINUT_COLET`;
        if (req.query.sort) {
            query += ` ORDER BY ${req.query.sort}`;
        }
        const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

app.delete('/api/continut-colete/:awb/:id_produs', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const { awb, id_produs } = req.params;
        await connection.execute(
            `DELETE FROM CONTINUT_COLET WHERE AWB = :awb AND ID_PRODUS = :id_produs`,
            { awb, id_produs },
            { autoCommit: true }
        );
        res.json({ message: 'Înregistrare ștearsă cu succes!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});


app.get('/api/livrari-colete', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        let query = `SELECT AWB, ID_LIVRATOR, DATA_LIVRARE FROM LIVRARE_COLET`;
        if (req.query.sort) {
            query += ` ORDER BY ${req.query.sort}`;
        }
        const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

app.delete('/api/livrari-colete/:awb/:id_livrator', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const { awb, id_livrator } = req.params;
        await connection.execute(
            `DELETE FROM LIVRARE_COLET WHERE AWB = :awb AND ID_LIVRATOR = :id_livrator`,
            { awb, id_livrator },
            { autoCommit: true }
        );
        res.json({ message: 'Înregistrare ștearsă cu succes!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});


app.get('/api/alocari-vehicule', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        let query = `SELECT ID_LIVRATOR, NR_INMATRICULARE, DATA_ALOCARE, DATA_ALOCARE as DATA_ALOCARE_RAW FROM ALOCARE_VEHICUL`;
        if (req.query.sort) {
            query += ` ORDER BY ${req.query.sort}`;
        }
        const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

app.delete('/api/alocari-vehicule/:id_livrator/:nr_inmatriculare/:data_alocare', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection();
        const { id_livrator, nr_inmatriculare, data_alocare } = req.params;
        await connection.execute(
            `DELETE FROM ALOCARE_VEHICUL WHERE ID_LIVRATOR = :id_livrator AND NR_INMATRICULARE = :nr_inmatriculare AND DATA_ALOCARE = TO_DATE(:data_alocare, 'YYYY-MM-DD"T"HH24:MI:SS.FF3"Z"')`,
            { id_livrator, nr_inmatriculare, data_alocare },
            { autoCommit: true }
        );
        res.json({ message: 'Înregistrare ștearsă cu succes!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});


// c) JOIN pe 3+ tabele cu 2+ condiții
app.get('/api/rapoarte/join-complex', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT
          c.awb AS "AWB",
          c.status AS "Status",
          c.valoare_ron AS "Valoare Colet",
          l.nume || ' ' || l.prenume AS "Livrator",
          l.salariu AS "Salariu Livrator"
      FROM
          COLET c
      JOIN
          LIVRARE_COLET lc ON c.awb = lc.awb
      JOIN
          LIVRATOR l ON lc.id_livrator = l.id_livrator
      WHERE
          c.status = 'In Tranzit' AND l.salariu > 4000`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// d) GROUP BY + HAVING
app.get('/api/rapoarte/group-by-having', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT
          c.awb AS "AWB",
          c.destinatar_nume || ' ' || c.destinatar_prenume AS "Destinatar",
          COUNT(p.id_produs) AS "Nr_Produse",
          LISTAGG(p.nume_produs, ', ') WITHIN GROUP (ORDER BY p.nume_produs) AS "Produse"
      FROM COLET c
      JOIN CONTINUT_COLET cc ON c.awb = cc.awb
      JOIN PRODUS p ON cc.id_produs = p.id_produs
      GROUP BY c.awb, c.destinatar_nume, c.destinatar_prenume
      HAVING COUNT(p.id_produs) > 1`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// f.1) View Compus (permite LMD)
app.get('/api/rapoarte/view-compus', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT * FROM v_colete_expeditori ORDER BY AWB`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Test UPDATE pe view
app.post('/api/rapoarte/test-update-view', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    // Găsește primul colet și schimbă statusul
    const firstColet = await connection.execute(
      `SELECT AWB, STATUS FROM v_colete_expeditori WHERE ROWNUM = 1`
    );

    if (firstColet.rows.length === 0) {
      return res.status(404).json({ error: 'Nu există colete în view' });
    }

    const awb = firstColet.rows[0][0];
    const statusVechi = firstColet.rows[0][1];
    const statusNou = statusVechi === 'In Depozit' ? 'In Tranzit' : 'In Depozit';

    // UPDATE prin view
    await connection.execute(
      `UPDATE v_colete_expeditori SET STATUS = :statusNou WHERE AWB = :awb`,
      { statusNou, awb },
      { autoCommit: true }
    );

    res.json({
      message: `UPDATE funcționează! Coletul ${awb} actualizat: ${statusVechi} → ${statusNou}`
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// f.2) View Complex (doar SELECT)
app.get('/api/rapoarte/view-complex', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT * FROM v_raport_depozite ORDER BY VALOARE_TOTALA DESC`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

startServer();