const mysql = require('mysql2/promise'); // Note o /promise
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  const initDb = async () => {
    try {
      // Tabela de instituições de ensino
      await pool.query(`
        CREATE TABLE IF NOT EXISTS instituicoes_ensino (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nome VARCHAR(200) NOT NULL,
          endereco VARCHAR(255) NOT NULL,
          cnpj VARCHAR(20) NOT NULL UNIQUE,
          telefone VARCHAR(20),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Tabela de usuários
      await pool.query(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nome VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          senha VARCHAR(255) NOT NULL,
          tipo ENUM('empresa', 'professor', 'aluno') DEFAULT 'aluno',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
  
      // Tabela de alunos
      await pool.query(`
        CREATE TABLE IF NOT EXISTS alunos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          usuario_id INT NOT NULL,
          cpf VARCHAR(20) NOT NULL UNIQUE,
          rg VARCHAR(20) NOT NULL UNIQUE,
          endereco VARCHAR(255) NOT NULL,
          curso VARCHAR(100) NOT NULL,
          saldo DECIMAL(10, 2) DEFAULT 0,
          instituicao_ensino_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
          FOREIGN KEY (instituicao_ensino_id) REFERENCES instituicoes_ensino(id)
        )
      `);
      
      // Tabela de empresas parceiras
      await pool.query(`
        CREATE TABLE IF NOT EXISTS empresas (
          id INT AUTO_INCREMENT PRIMARY KEY,
          usuario_id INT NOT NULL,
          cnpj VARCHAR(20) NOT NULL UNIQUE,
          endereco VARCHAR(255) NOT NULL,
          telefone VARCHAR(20),
          email VARCHAR(100) NOT NULL,
          descricao TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
        )
      `);
      
      console.log('Banco de dados inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar banco de dados:', error);
    }
  };
  
  // Inicializa o banco de dados quando o arquivo é importado
initDb();

module.exports = pool;