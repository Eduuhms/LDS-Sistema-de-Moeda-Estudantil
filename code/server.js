const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Tela Inicial disponível em: http://localhost:${PORT}/`);
  console.log(`Para acessar o sistema, clique no link acima`);
});