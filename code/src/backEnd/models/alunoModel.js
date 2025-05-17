const db = require('../.config/db');
const usuarioModel = require('./usuarioModel');

const post = async (nome, email, senha, cpf, rg, endereco, curso, instituicaoEnsinoId) => {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Cria usuário
        const usuarioId = await usuarioModel.post(nome, email, senha);

        // 2. Cria aluno
        await connection.query(
            `INSERT INTO aluno 
             (id, cpf, rg, endereco, curso, saldo_moedas, instituicao_ensino_id)
             VALUES (?, ?, ?, ?, ?, 0, ?)`,
            [usuarioId, cpf, rg, endereco, curso, instituicaoEnsinoId]
        );

        await connection.commit();
        return usuarioId;
    } catch (err) {
        if (connection) await connection.rollback();
        throw err;
    } finally {
        if (connection) connection.release();
    }
};

const getById = async (id) => {
    try {
        const [rows] = await db.query(
            `SELECT u.*, a.cpf, a.rg, a.endereco, a.curso, a.saldo_moedas as saldoMoedas, 
                    a.instituicao_ensino_id as instituicaoEnsinoId
             FROM usuario u
             JOIN aluno a ON u.id = a.id
             WHERE u.id = ?`,
            [id]
        );
        return rows[0] || null;
    } catch (err) {
        throw err;
    }
};

const getAll = async () => {
    try {
        const [rows] = await db.query(
            `SELECT u.*, a.cpf, a.rg, a.endereco, a.curso, a.saldo_moedas as saldoMoedas, 
                    a.instituicao_ensino_id as instituicaoEnsinoId
             FROM usuario u
             JOIN aluno a ON u.id = a.id`
        );
        return rows;
    } catch (err) {
        throw err;
    }
};

const put = async (id, nome, email, senha, cpf, rg, endereco, curso, instituicaoEnsinoId) => {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Atualiza usuário
        await usuarioModel.put(id, nome, email, senha);

        // 2. Atualiza aluno
        await connection.query(
            `UPDATE aluno
             SET cpf = COALESCE(?, cpf),
                 rg = COALESCE(?, rg),
                 endereco = COALESCE(?, endereco),
                 curso = COALESCE(?, curso),
                 instituicao_ensino_id = COALESCE(?, instituicao_ensino_id)
             WHERE id = ?`,
            [cpf, rg, endereco, curso, instituicaoEnsinoId, id]
        );

        await connection.commit();
    } catch (err) {
        if (connection) await connection.rollback();
        throw err;
    } finally {
        if (connection) connection.release();
    }
};

const patch = async (id, nome, email, senha, cpf, rg, endereco, curso, instituicaoEnsinoId) => {
    return put(id, nome, email, senha, cpf, rg, endereco, curso, instituicaoEnsinoId);
};

const del = async (id) => {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Deleta aluno
        await connection.query("DELETE FROM aluno WHERE id = ?", [id]);

        // 2. Deleta usuário
        await usuarioModel.del(id);

        await connection.commit();
    } catch (err) {
        if (connection) await connection.rollback();
        throw err;
    } finally {
        if (connection) connection.release();
    }
};

const receberMoedas = async (alunoId, quantidade) => {
    try {
        const [result] = await db.query(
            `UPDATE aluno
             SET saldo_moedas = saldo_moedas + ?
             WHERE id = ?`,
            [quantidade, alunoId]
        );
        return result;
    } catch (err) {
        throw err;
    }
};

const getSaldoMoedas = async (alunoId) => {
    try {
        const [rows] = await db.query(
            "SELECT saldo_moedas as saldoMoedas FROM aluno WHERE id = ?",
            [alunoId]
        );
        return rows[0]?.saldoMoedas || null;
    } catch (err) {
        throw err;
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