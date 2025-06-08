```code

@startuml
title Resgatar Vantagem (Aluno)

participant "Frontend" as FE
participant "VantagemController" as VC
participant "VantagemModel" as VM
participant "TransacaoModel" as TM
participant "ResgateModel" as RM
participant "AlunoModel" as AM
database "Banco de Dados" as DB

ref over VC : Login obrigatório\n(verificação de sessão)

== Resgatar Vantagem ==
autonumber 1.1
FE -> VC: POST /vantagens/resgatar {vantagemId}
activate VC

VC -> AM: buscarPorUsuarioId(alunoId)
activate AM
AM -> DB: SELECT * FROM alunos\nWHERE usuario_id = ?
activate DB
DB --> AM: dadosAluno
deactivate DB
AM --> VC: dadosAluno
deactivate AM

VC -> VM: buscarPorId(vantagemId)
activate VM
VM -> DB: SELECT * FROM vantagens\nWHERE id = ?
activate DB
DB --> VM: dadosVantagem
deactivate DB
VM --> VC: dadosVantagem
deactivate VM

alt Saldo insuficiente
    VC --> FE: 400 Saldo insuficiente
else Resgate válido
    VC -> TM: criar(transacao)
    activate TM

    
    TM -> DB: INSERT INTO transacoes\n(dadosTransacao)
    activate DB
    DB --> TM: transacaoId
    deactivate DB
    TM --> VC: transacaoId
    deactivate TM

    VC -> RM: criar(resgate)
    activate RM
    
    
    RM -> DB: INSERT INTO resgates\n(dadosResgate)
    activate DB
    DB --> RM: resgateId
    deactivate DB
    RM --> VC: resgateId
    deactivate RM

    VC -> AM: atualizarSaldo(alunoId, novoSaldo)
    activate AM
    AM -> DB: UPDATE alunos SET saldo = ?\nWHERE id = ?
    activate DB
    DB --> AM: sucesso
    deactivate DB
    AM --> VC: sucesso
    deactivate AM

    VC --> FE: 200 {mensagem, saldoAtual}
end

deactivate VC
@enduml

```