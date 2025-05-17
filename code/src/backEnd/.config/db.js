const mysql = require('mysql2/promise');

// Configuração otimizada com pool de conexões
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'moeda',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Teste de conexão ao iniciar
pool.getConnection()
  .then(connection => {
    console.log('Conexão com MySQL estabelecida via pool!');
    connection.release();
  })
  .catch(err => {
    console.error('Erro ao conectar ao MySQL:', err);
  });

// Exporta o pool diretamente
module.exports = pool;