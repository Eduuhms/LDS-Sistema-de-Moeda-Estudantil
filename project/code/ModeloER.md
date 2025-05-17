
# Modelo Entidade-Relacionamento (ER)

- **Usuario**(<u>id</u>, nome, email, senha)
- **Aluno**(<u>usuario_id</u> [FK → Usuario], cpf, rg, endereco, curso, saldoMoedas, instituicaoEnsino_id [FK → InstituicaoEnsino])
- **Professor**(<u>usuario_id</u> [FK → Usuario], cpf, departamento, instituicaoEnsino_id [FK → InstituicaoEnsino], saldoMoedas)
- **EmpresaParceira**(<u>usuario_id</u> [FK → Usuario],cnpj, descricao, enderecoFisico)
- **InstituicaoEnsino**(<u>id</u>, nome, endereco, cnpj)
- **Vantagem**(<u>id</u>, nome, descricao, foto, custoMoedas, empresaParceira_cnpj [FK → EmpresaParceira])
- **Transacao**(<u>id</u>, dataHora, quantidade, mensagem, origem_id [FK → Usuario], destino_id [FK → Usuario], tipoTransacao [ENUM])
- **Resgate**(<u>id</u>, dataHora, aluno_id [FK → Aluno], vantagem_id [FK → Vantagem] codigo, status [ENUM])
