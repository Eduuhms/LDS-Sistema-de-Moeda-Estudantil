const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Para acessar o sistema, clique no link acima ou navegue para http://localhost:${PORT}/`);
});