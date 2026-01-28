const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: '1234',
    database: 'sigp_inei'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Update estado to 'Por hacer'
    const result = await client.query(
      "UPDATE agile.tareas SET estado = 'Por hacer' WHERE codigo = 'TAR-002' RETURNING id, codigo, nombre, estado"
    );

    if (result.rows.length > 0) {
      console.log('Tarea actualizada:', result.rows[0]);
    } else {
      console.log('No se encontro TAR-002');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

main();
