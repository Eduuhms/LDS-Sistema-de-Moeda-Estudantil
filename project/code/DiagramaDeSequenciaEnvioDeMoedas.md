```code

@startuml
title Envio de Moedas - Fluxo MVC
autonumber 1.1

actor Usuário
participant TransacaoController as Controller
participant TransacaoModel as Transacao
participant UsuarioModel as Usuario
participant ProfessorModel as Professor
participant AlunoModel as Aluno
database "Banco de Dados" as DB

Usuário -> Controller: Enviar transação
activate Controller

note over Controller
Valida quantidade, origemId, destinoId e tipoTransacao
end note

Controller -> Transacao: criar(dados)
activate Transacao

Transacao -> DB: INSERT INTO transacoes (...)
DB --> Transacao: insertId
deactivate Transacao

Transacao -> DB: SELECT * FROM transacoes WHERE id = ?
DB --> Transacao: transacao
Controller <- Transacao: transacao

note over Controller
Busca usuário de origem e destino
end note

Controller -> Usuario: buscarPorId(origemId)
Usuario --> Controller: usuarioOrigem

alt usuarioOrigem.tipo == "professor"
    Controller -> Professor: buscarPorUsuarioId(origemId)
    activate Professor
    Professor --> Controller: professorOrigem
    deactivate Professor
else if usuarioOrigem.tipo == "aluno"
    Controller -> Aluno: buscarPorUsuarioId(origemId)
    activate Aluno
    Aluno --> Controller: alunoOrigem
    deactivate Aluno
end

note over Controller
saldo -= quantidade
end note

alt usuarioOrigem.tipo == "professor"
    Controller -> Professor: atualizarSaldo(professorOrigem.id, novoSaldo)
else
    Controller -> Aluno: atualizarSaldo(alunoOrigem.id, novoSaldo)
end

Controller -> Usuario: buscarPorId(destinoId)
Usuario --> Controller: usuarioDestino

alt usuarioDestino.tipo == "professor"
    Controller -> Professor: buscarPorUsuarioId(destinoId)
    activate Professor
    Professor --> Controller: professorDestino
    deactivate Professor
else if usuarioDestino.tipo == "aluno"
    Controller -> Aluno: buscarPorUsuarioId(destinoId)
    activate Aluno
    Aluno --> Controller: alunoDestino
    deactivate Aluno
end

note over Controller
saldo += quantidade
end note

alt usuarioDestino.tipo == "professor"
    Controller -> Professor: atualizarSaldo(professorDestino.id, novoSaldo)
else
    Controller -> Aluno: atualizarSaldo(alunoDestino.id, novoSaldo)
end

Controller --> Usuário: Transação criada com sucesso
deactivate Controller
@enduml

```
