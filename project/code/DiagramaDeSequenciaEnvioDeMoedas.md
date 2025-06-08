```code

@startuml
title Envio de Moedas - Fluxo MVC Atualizado
autonumber 1.1

actor Usuário
participant TransacaoController as Controller
participant TransacaoModel as Transacao
participant UsuarioModel as Usuario
database "Banco de Dados" as DB

Usuário -> Controller: Enviar transação
activate Controller

note over Controller
Valida quantidade, origemId, destinoId e tipoTransacao
end note

Controller -> Transacao: criar({quantidade, mensagem, origemId, destinoId, tipoTransacao})
activate Transacao
Transacao -> DB: INSERT INTO transacoes (...)
DB --> Transacao: insertId
deactivate Transacao

Controller -> Usuario: buscarPorId(origemId)
Usuario --> Controller: usuarioOrigem

alt usuarioOrigem.tipo != "empresa"
    Controller -> Usuario: buscarDadosUsuario(usuarioOrigem)
    Usuario --> Controller: dadosOrigem

    note over Controller
    saldoOrigem -= quantidade
    end note

    Controller -> Usuario: atualizarSaldoUsuario(usuarioOrigem, novoSaldoOrigem)
end

Controller -> Usuario: buscarPorId(destinoId)
Usuario --> Controller: usuarioDestino

alt usuarioDestino.tipo != "empresa"
    Controller -> Usuario: buscarDadosUsuario(usuarioDestino)
    Usuario --> Controller: dadosDestino

    note over Controller
    saldoDestino += quantidade
    end note

    Controller -> Usuario: atualizarSaldoUsuario(usuarioDestino, novoSaldoDestino)
end

Controller --> Usuário: Transação criada com sucesso (transacao)
deactivate Controller
@enduml


```
