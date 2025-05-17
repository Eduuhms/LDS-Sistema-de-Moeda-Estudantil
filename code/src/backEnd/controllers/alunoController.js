const alunoModel = require('../models/alunoModel');

const post = async (req, res) => {
    const { nome, email, senha, cpf, rg, endereco, curso, instituicaoEnsinoId } = req.body;

    if (!nome || !email || !senha || !cpf || !rg || !endereco || !curso || !instituicaoEnsinoId) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    try {
        const id = await alunoModel.post(nome, email, senha, cpf, rg, endereco, curso, instituicaoEnsinoId);
        return res.status(201).json({ id, message: "Aluno criado com sucesso" });
    } catch (err) {
        console.error('Erro ao criar aluno:', err);
        return res.status(500).json({ 
            error: err.message,
            details: err.sqlMessage || 'Erro no banco de dados' 
        });
    }
};

const getById = async (req, res) => {
    const id = req.params.id;

    try {
        const aluno = await alunoModel.getById(id);
        if (!aluno) {
            return res.status(404).json({ error: "Aluno não encontrado" });
        }
        return res.status(200).json(aluno);
    } catch (err) {
        console.error('Erro ao buscar aluno:', err);
        return res.status(500).json({ error: err.message });
    }
};

const getAll = async (req, res) => {
    try {
        const alunos = await alunoModel.getAll();
        return res.status(200).json(alunos);
    } catch (err) {
        console.error('Erro ao listar alunos:', err);
        return res.status(500).json({ error: err.message });
    }
};

const put = async (req, res) => {
    const id = req.params.id;
    const { nome, email, senha, cpf, rg, endereco, curso, instituicaoEnsinoId } = req.body;

    try {
        await alunoModel.put(id, nome, email, senha, cpf, rg, endereco, curso, instituicaoEnsinoId);
        return res.status(200).json({ message: "Aluno atualizado com sucesso" });
    } catch (err) {
        console.error('Erro ao atualizar aluno:', err);
        return res.status(500).json({ error: err.message });
    }
};

const patch = async (req, res) => {
    const id = req.params.id;
    const { nome, email, senha, cpf, rg, endereco, curso, instituicaoEnsinoId } = req.body;

    try {
        await alunoModel.patch(id, nome, email, senha, cpf, rg, endereco, curso, instituicaoEnsinoId);
        return res.status(200).json({ message: "Aluno atualizado com sucesso" });
    } catch (err) {
        console.error('Erro ao atualizar aluno:', err);
        return res.status(500).json({ error: err.message });
    }
};

const del = async (req, res) => {
    const id = req.params.id;

    try {
        await alunoModel.del(id);
        return res.status(200).json({ message: "Aluno deletado com sucesso" });
    } catch (err) {
        console.error('Erro ao deletar aluno:', err);
        return res.status(500).json({ error: err.message });
    }
};

const receberMoedas = async (req, res) => {
    const { alunoId, quantidade, mensagem, professorId } = req.body;

    if (!alunoId || !quantidade || !mensagem || !professorId) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    try {
        await alunoModel.receberMoedas(alunoId, quantidade);
        return res.status(200).json({ message: "Moedas recebidas com sucesso" });
    } catch (err) {
        console.error('Erro ao enviar moedas:', err);
        return res.status(500).json({ error: err.message });
    }
};

const getSaldoMoedas = async (req, res) => {
    const alunoId = req.params.id;

    try {
        const saldo = await alunoModel.getSaldoMoedas(alunoId);
        if (saldo === null) {
            return res.status(404).json({ error: "Aluno não encontrado" });
        }
        return res.status(200).json({ saldo });
    } catch (err) {
        console.error('Erro ao consultar saldo:', err);
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    post,
    getById,
    getAll,
    put,
    patch,
    del,
    receberMoedas,
    getSaldoMoedas
};