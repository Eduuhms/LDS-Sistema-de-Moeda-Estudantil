const express = require('express');
const app = express();
const alunoRoutes = require('./routes/alunoRoutes');


app.use(express.json());

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.use('/aluno', alunoRoutes);


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});