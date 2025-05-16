const createConnection = require('./dbDirect');

async function test() {
  try {
    const connection = await createConnection();
    const [rows] = await connection.execute('SELECT 1 + 1 AS solution');
    console.log('Resultado:', rows[0].solution);
    await connection.end();
  } catch (err) {
    console.error('Erro:', err);
  }
}

test();