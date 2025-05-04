
# Modelo Entidade-Relacionamento (ER)

- **Usuario**(id, nome, email, senha)
- **Aluno**(usuario_id [PK, FK → Usuario], cpf, rg, endereco, curso, saldoMoedas, instituicaoEnsino_id [FK → InstituicaoEnsino])
- **Professor**(usuario_id [PK, FK → Usuario], cpf, departamento, instituicaoEnsino_id [FK → InstituicaoEnsino], saldoMoedas)
- **InstituicaoEnsino**(id, nome, endereco, cnpj)
- **EmpresaParceira**(cnpj [PK], descricao, enderecoFisico)
- **Vantagem**(id, nome, descricao, foto, custoMoedas, empresaParceira_cnpj [FK → EmpresaParceira])
- **Transacao**(id, dataHora, quantidade, mensagem, origem_id [FK → Usuario], destino_id [FK → Usuario], tipoTransacao [ENUM])
- **Resgate**(id, dataHora, codigo, status [ENUM], aluno_id [FK → Aluno], vantagem_id [FK → Vantagem])
