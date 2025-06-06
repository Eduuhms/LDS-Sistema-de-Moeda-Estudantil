const VantagemModel = require('../models/VantagemModel');

class VantagemController {
    static async cadastrar(req, res) {
        try {
            const { nome, descricao, foto, custoMoedas, empresaId } = req.body;

            if (!nome || !descricao || !foto || !custoMoedas || !empresaId) {
                return res.status(400).json({
                    erro: 'Todos os campos são obrigatórios'
                });
            }

            // Validação do custo em moedas
            const custoNumerico = parseInt(custoMoedas);
            if (isNaN(custoNumerico) || custoNumerico <= 0) {
                return res.status(400).json({
                    erro: 'O custo em moedas deve ser um número positivo maior que zero'
                });
            }

            const vantagem = await VantagemModel.criar({
                nome,
                descricao,
                foto,
                custoMoedas,
                empresaId
            });

            return res.status(201).json({
                mensagem: 'Vantagem cadastrada com sucesso',
                vantagem: {
                    id: vantagem,
                    nome,
                    descricao,
                    foto,
                    custoMoedas,
                    empresaId
                }
            });
        } catch (error) {
            console.error('Erro ao cadastrar vantagem:', error);
            return res.status(500).json({
                erro: 'Falha ao cadastrar vantagem. Por favor, tente novamente mais tarde.'
            });
        }
    }

    static async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nome, descricao, foto, custoMoedas, empresaId } = req.body;

            if (!nome || !descricao || !foto || !custoMoedas || !empresaId) {
                return res.status(400).json({
                    erro: 'Todos os campos são obrigatórios'
                });
            }

            // Validação do custo em moedas
            const custoNumerico = parseInt(custoMoedas);
            if (isNaN(custoNumerico) || custoNumerico <= 0) {
                return res.status(400).json({
                    erro: 'O custo em moedas deve ser um número positivo maior que zero'
                });
            }

            const atualizado = await VantagemModel.atualizar(id, {
                nome,
                descricao,
                foto,
                custoMoedas,
                empresaId
            });

            if (!atualizado) {
                return res.status(404).json({
                    erro: 'Vantagem não encontrada'
                });
            }

            return res.status(200).json({
                mensagem: 'Vantagem atualizada com sucesso',
                vantagem: {
                    id,
                    nome,
                    descricao,
                    foto,
                    custoMoedas,
                    empresaId
                }
            });
        } catch (error) {
            console.error('Erro ao atualizar vantagem:', error);
            return res.status(500).json({
                erro: 'Falha ao atualizar vantagem. Por favor, tente novamente mais tarde.'
            });
        }
    }

    static async deletar(req, res) {
        try {
            const { id } = req.params;

            const deletado = await VantagemModel.deletar(id);

            if (!deletado) {
                return res.status(404).json({
                    erro: 'Vantagem não encontrada'
                });
            }

            return res.status(200).json({
                mensagem: 'Vantagem deletada com sucesso'
            });
        } catch (error) {
            console.error('Erro ao deletar vantagem:', error);
            return res.status(500).json({
                erro: 'Falha ao deletar vantagem. Por favor, tente novamente mais tarde.'
            });
        }
    }

    static async buscarTodos(req, res) {
        try {
            const vantagens = await VantagemModel.buscarTodos();

            return res.status(200).json(vantagens);
        } catch (error) {
            console.error('Erro ao buscar vantagens:', error);
            return res.status(500).json({
                erro: 'Falha ao buscar vantagens. Por favor, tente novamente mais tarde.'
            });
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;

            const vantagem = await VantagemModel.buscarPorId(id);

            if (!vantagem) {
                return res.status(404).json({
                    erro: 'Vantagem não encontrada'
                });
            }

            return res.status(200).json(vantagem);
        } catch (error) {
            console.error('Erro ao buscar vantagem:', error);
            return res.status(500).json({
                erro: 'Falha ao buscar vantagem. Por favor, tente novamente mais tarde.'
            });
        }
    }

    static async buscarPorEmpresaLogada(req, res) {
        try {
            if (!req.session.userId) {
                return res.status(401).json({ erro: 'Usuário não autenticado' });
            }

            // Busca o ID da empresa baseado no usuário logado
            const EmpresaModel = require('../models/EmpresaModel');
            const empresa = await EmpresaModel.buscarPorUsuarioId(req.session.userId);

            if (!empresa) {
                return res.status(404).json({ erro: 'Empresa não encontrada para este usuário' });
            }

            const vantagens = await VantagemModel.buscarPorEmpresa(empresa.id);

            return res.status(200).json(vantagens);
        } catch (error) {
            console.error('Erro ao buscar vantagens da empresa:', error);
            return res.status(500).json({
                erro: 'Falha ao buscar vantagens da empresa. Por favor, tente novamente mais tarde.'
            });
        }
    }


    static async renderVantagensEmpresa(req, res) {
        if (!req.session.userId) {
            return res.redirect('/usuario/login');
        }
        // Verifica se o usuário é uma empresa
        const EmpresaModel = require('../models/EmpresaModel');
        const usuario = await EmpresaModel.buscarPorUsuarioId(req.session.userId);
        if (!usuario) {
            return res.status(403).render('error', { erro: 'Acesso negado. Apenas empresas podem acessar esta página.' });
        }
        res.render('vantagens-empresa');
    }

    static async renderVantagensAluno(req, res) {
        if (!req.session.userId) {
            return res.redirect('/usuario/login');
        }
        // Verifica se o usuário é um aluno
        const AlunoModel = require('../models/AlunoModel');
        const usuario = await AlunoModel.buscarPorUsuarioId(req.session.userId);
        if (!usuario) {
            return res.status(403).render('error', { erro: 'Acesso negado. Apenas alunos podem acessar esta página.' });
        }
        res.render('vantagens-aluno');
    }

    static async resgatarVantagem(req, res) {
        try {
            const { vantagemId } = req.body;
            const alunoId = req.session.userId;

            if (!alunoId) {
                return res.status(401).json({ erro: 'Usuário não autenticado' });
            }

            // Verifica se o usuário é um aluno
            const AlunoModel = require('../models/AlunoModel');
            const aluno = await AlunoModel.buscarPorUsuarioId(alunoId);
            if (!aluno) {
                return res.status(403).json({ erro: 'Apenas alunos podem resgatar vantagens' });
            }

            // Busca a vantagem
            const vantagem = await VantagemModel.buscarPorId(vantagemId);
            if (!vantagem) {
                return res.status(404).json({ erro: 'Vantagem não encontrada' });
            }

            // Verifica saldo do aluno
            if (aluno.saldo < vantagem.custo_moedas) {
                return res.status(400).json({ erro: 'Saldo insuficiente para resgatar esta vantagem' });
            }

            // Cria a transação de resgate
            const TransacaoModel = require('../models/TransacaoModel');
            const transacaoId = await TransacaoModel.criar({
                quantidade: vantagem.custo_moedas,
                mensagem: `Resgate da vantagem: ${vantagem.nome}`,
                origemId: alunoId,
                destinoId: vantagem.empresa_id,
                tipoTransacao: 'RESGATE_VANTAGEM'
            });

            // Atualiza o saldo do aluno (debitando o valor)
            const novoSaldo = aluno.saldo - vantagem.custo_moedas;
            await AlunoModel.atualizarSaldo(aluno.id, novoSaldo);

            return res.status(200).json({
                mensagem: 'Vantagem resgatada com sucesso',
                transacaoId,
                saldoAtual: novoSaldo
            });

        } catch (error) {
            console.error('Erro ao resgatar vantagem:', error);
            return res.status(500).json({
                erro: 'Falha ao resgatar vantagem. Por favor, tente novamente mais tarde.'
            });
        }
    }
}



module.exports = VantagemController;