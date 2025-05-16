const mysql = require('mysql2/promise'); // Note o /promise

async function createConnection() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'moeda',
    port: 3306
  });
  console.log('Conectado ao MySQL com mysql2!');
  return connection;
}

module.exports = createConnection;