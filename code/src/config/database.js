const mysql = require('mysql2/promise');
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
          tipo ENUM('empresa', 'professor', 'aluno', 'instituicao') DEFAULT 'aluno',
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

    // Tabela de professores
    await pool.query(`
  CREATE TABLE IF NOT EXISTS professores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    cpf VARCHAR(20) NOT NULL UNIQUE,
    departamento VARCHAR(100) NOT NULL,
    saldo DECIMAL(10, 2) DEFAULT 0,
    instituicao_ensino_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (instituicao_ensino_id) REFERENCES instituicoes_ensino(id)
  )
`);

    await pool.query(
      `CREATE TABLE IF NOT EXISTS transacoes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      quantidade DECIMAL(10,2) NOT NULL,
      mensagem TEXT NOT NULL,
      origem_id INT NOT NULL,
      destino_id INT NOT NULL,
      tipo_transacao VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (origem_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY (destino_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )`
    );

    await pool.query(`
        CREATE TABLE IF NOT EXISTS vantagens (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nome VARCHAR(100) NOT NULL,
          descricao TEXT,
          foto VARCHAR(255),
          custo_moedas INT NOT NULL,
          empresa_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
        )
      `);


      await pool.query(`
       CREATE TABLE  IF NOT EXISTS resgates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data_resgate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aluno_id INT NOT NULL,
    vantagem_id INT NOT NULL,
    transacao_id INT NOT NULL,
    codigo VARCHAR(10) NOT NULL,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id),
    FOREIGN KEY (vantagem_id) REFERENCES vantagens(id),
    FOREIGN KEY (transacao_id) REFERENCES transacoes(id)
)
    `);

    // Verificar se o usuário instituição já existe
    const [userRows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', ['instituicao@gmail.com']);
    
    if (userRows.length === 0) {
      // Criar usuário instituição
      const [result] = await pool.query(
        'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
        ['Instituicao de Ensino', 'instituicao@gmail.com', '123456', 'instituicao']
      );
      const userId = result.insertId;

      // Criar registro na tabela instituicoes_ensino
      await pool.query(
        `INSERT INTO instituicoes_ensino 
        (nome, endereco, cnpj, telefone) 
        VALUES (?, ?, ?, ?)`,
        [
          'PUC Minas', 
          'Endereço da Instituição', 
          '00.000.000/0000-00', 
          '(00) 0000-0000'
        ]
      );

      console.log('Usuário instituição e registro na tabela instituicoes_ensino criados com sucesso');
    }

    console.log('Banco de dados inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
  }
};

// Inicializa o banco de dados quando o arquivo é importado
initDb();

module.exports = pool;