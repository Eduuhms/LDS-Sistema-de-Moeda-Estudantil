const db = require('../src/config/database');

async function migrarTabelas() {
  try {
    console.log('Iniciando migração do banco de dados...');
    
    // Verificando se a tabela usuarios existe
    const [usuariosRows] = await db.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'usuarios'
    `);
    
    if (usuariosRows.length === 0) {
      console.error('Tabela de usuários não encontrada. Execute a inicialização do banco primeiro.');
      process.exit(1);
    }
    
    // Verificando se a tabela empresas existe
    const [empresasRows] = await db.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'empresas'
    `);
    
    const empresasExistem = empresasRows.length > 0;
    
    if (empresasExistem) {
      // Backup dos dados das empresas existentes
      console.log('Fazendo backup dos dados das empresas...');
      const [empresasExistentes] = await db.query('SELECT * FROM empresas');
      
      if (empresasExistentes.length > 0) {
        console.log(`Encontradas ${empresasExistentes.length} empresas para migração.`);
        
        // Dropa a tabela empresas existente
        console.log('Recriando tabela de empresas...');
        await db.query('DROP TABLE IF EXISTS empresas');
        
        // Cria a tabela empresas com a nova estrutura
        await db.query(`
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
        
        // Migra os dados para o novo formato
        console.log('Migrando dados das empresas...');
        for (const empresa of empresasExistentes) {
          // Cria um usuário para cada empresa
          const senha = await require('bcrypt').hash('senha_padrao', 10); // Senha temporária
          
          // Insere o usuário
          const [resultUsuario] = await db.query(
            'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)',
            [empresa.nome, empresa.email, senha, 'empresa']
          );
          
          const usuarioId = resultUsuario.insertId;
          
          // Insere a empresa com a referência ao usuário
          await db.query(
            'INSERT INTO empresas (usuario_id, cnpj, endereco, telefone, email, descricao) VALUES (?, ?, ?, ?, ?, ?)',
            [usuarioId, empresa.cnpj, empresa.endereco, empresa.telefone, empresa.email, empresa.descricao]
          );
          
          console.log(`Migrada empresa: ${empresa.nome} (ID: ${empresa.id} -> ${usuarioId})`);
        }
      } else {
        console.log('Não há empresas para migrar. Recriando a tabela...');
        await db.query('DROP TABLE IF EXISTS empresas');
        await criarTabelaEmpresas();
      }
    } else {
      // Se a tabela empresas não existe, cria com a nova estrutura
      console.log('Tabela de empresas não encontrada. Criando tabela...');
      await criarTabelaEmpresas();
    }
    
    console.log('Migração concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro durante a migração:', error);
    process.exit(1);
  }
}

async function criarTabelaEmpresas() {
  await db.query(`
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
}

migrarTabelas(); 