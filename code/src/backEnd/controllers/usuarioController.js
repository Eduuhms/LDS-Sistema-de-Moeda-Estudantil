const usuarioModel = require('../models/usuarioModel');

const getAll = (req, res) => {
    usuarioModel.getAll()
        .then((data) => {
            return res.status(200).json(data);
        })
        .catch((err) => {
            return res.status(500).json({error: err.message});
        });
};

const getById = (req, res) => {
    const id = req.params.id;

    usuarioModel.getById(id)
        .then((data) => {
            if(!data) {
                return res.status(404).json({error: "Usuário não encontrado"});
            }
            return res.status(200).json(data);
        })
        .catch((err) => {
            return res.status(500).json({error: err.message});
        });
};

const post = (req, res) => {
    const {nome, email, senha} = req.body;

    if(!nome || !email || !senha) {
        return res.status(400).json({error: "Nome, email e senha são obrigatórios"});
    }

    usuarioModel.post(nome, email, senha)
        .then((id) => {
            return res.status(201).json({id, message: "Usuário criado com sucesso"});
        })
        .catch((err) => {
            return res.status(500).json({error: err.message});
        });
};

const put = (req, res) => {
    const id = req.params.id;
    const {nome, email, senha} = req.body;

    usuarioModel.put(id, nome, email, senha)
        .then(() => {
            return res.status(200).json({message: "Usuário atualizado com sucesso"});
        })
        .catch((err) => {
            return res.status(500).json({error: err.message});
        });
};

const patch = (req, res) => {
    const id = req.params.id;
    const {nome, email, senha} = req.body;

    usuarioModel.patch(id, nome, email, senha)
        .then(() => {
            return res.status(200).json({message: "Usuário atualizado com sucesso"});
        })
        .catch((err) => {
            return res.status(500).json({error: err.message});
        });
};

const del = (req, res) => {
    const id = req.params.id;

    usuarioModel.del(id)
        .then(() => {
            return res.status(200).json({message: "Usuário deletado com sucesso"});
        })
        .catch((err) => {
            return res.status(500).json({error: err.message});
        });
};

const autenticar = (req, res) => {
    const {email, senha} = req.body;

    if(!email || !senha) {
        return res.status(400).json({error: "Email e senha são obrigatórios"});
    }

    usuarioModel.autenticar(email, senha)
        .then((id) => {
            if(!id) {
                return res.status(401).json({error: "Credenciais inválidas"});
            }
            return res.status(200).json({id, message: "Autenticação bem-sucedida"});
        })
        .catch((err) => {
            return res.status(500).json({error: err.message});
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