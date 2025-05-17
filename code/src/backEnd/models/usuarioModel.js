const conn = require('../.config/db');

const getAll = () => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM usuario";
        conn.query(query, (err, data) => {
            if(err) {
                return reject(err);
            }
            resolve(data);
        });
    });
};

const getById = (id) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM usuario WHERE id = ?";
        conn.query(query, [id], (err, data) => {
            if(err) {
                return reject(err);
            }

            if (data.length === 0) {
                resolve(null);
            }
            resolve(data[0]);
        });
    });
};

const post = (nome, email, senha) => {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO usuario 
            (nome, email, senha)
            VALUES (?, ?, ?);
        `;

        conn.query(query, [nome, email, senha], (err, data) => {
            if(err) {
                return reject(err);
            }
            resolve(data.insertId);
        });
    });
};

const put = (id, nome, email, senha) => {
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE usuario
            SET nome = COALESCE(?, nome),
                email = COALESCE(?, email),
                senha = COALESCE(?, senha)
            WHERE id = ?
        `;

        conn.query(query, [nome, email, senha, id], (err, data) => {
            if(err) {
                return reject(err);
            }
            resolve(data);
        });
    });
};

const patch = (id, nome, email, senha) => {
    return put(id, nome, email, senha); // Reaproveita a mesma função do put
};

const del = (id) => {
    return new Promise((resolve, reject) => {
        const query = "DELETE FROM usuario WHERE id = ?";

        conn.query(query, [id], (err, data) => {
            if(err) {
                return reject(err);
            }
            resolve(data);
        });
    });
};

const autenticar = (email, senha) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT id FROM usuario WHERE email = ? AND senha = ?";
        conn.query(query, [email, senha], (err, data) => {
            if(err) {
                return reject(err);
            }
            resolve(data.length > 0 ? data[0].id : null);
        });
    });
};

module.exports = {
    getAll,
    getById,
    post,
    put,
    patch,
    del,
    autenticar
};