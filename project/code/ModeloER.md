
# Modelo Entidade-Relacionamento (ER)

- **Usuario**(<ins>id</ins>, nome, email, senha)
- **Aluno**(<ins>usuario_id</ins> [FK → Usuario], cpf, rg, endereco, curso, saldoMoedas, instituicaoEnsino_id [FK → InstituicaoEnsino])
- **Professor**(<ins>usuario_id</ins> [FK → Usuario], cpf, departamento, instituicaoEnsino_id [FK → InstituicaoEnsino], saldoMoedas)
- **EmpresaParceira**(<ins>usuario_id</ins> [FK → Usuario],cnpj, descricao, enderecoFisico)
- **InstituicaoEnsino**(<ins>id</ins>, nome, endereco, cnpj)
- **Vantagem**(<ins>id</ins>, nome, descricao, foto, custoMoedas, empresaParceira_cnpj [FK → EmpresaParceira])
- **Transacao**(<ins>id</ins>, dataHora, quantidade, mensagem, origem_id [FK → Usuario], destino_id [FK → Usuario], tipoTransacao [ENUM])
- **Resgate**(<ins>id</ins>, dataHora, aluno_id [FK → Aluno], vantagem_id [FK → Vantagem] codigo, status [ENUM])
