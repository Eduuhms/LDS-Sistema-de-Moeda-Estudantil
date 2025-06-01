```code

@startuml
title Visualizar Extrato (Aluno/Professor)
autonumber 1.1

actor Usuario
participant "TransacaoController" as Controller
participant "TransacaoModel" as Transacao
participant "UsuarioModel" as UsuarioModel
database "Banco de Dados" as DB

== Requisição de Extrato ==
activate Controller

note right of Controller
Verifica se o userId existe(se não, retorna 401)
end note

Controller -> UsuarioModel: buscarPorId(req.session.userId)
activate UsuarioModel

UsuarioModel -> DB: SELECT * FROM usuarios WHERE id = ?
activate DB
DB --> UsuarioModel: dados do usuário
deactivate DB

UsuarioModel --> Controller: usuário
deactivate UsuarioModel

note right of Controller
Verifica se o usuário existe e não é empresa
end note

Controller -> Transacao: buscarPorUsuario(req.session.userId)
activate Transacao

Transacao -> DB: SELECT t.*, u_origem.nome, u_destino.nome\nFROM transacoes t\nLEFT JOIN usuarios u_origem\nLEFT JOIN usuarios u_destino\nWHERE origem_id = ? OR destino_id = ?
activate DB
DB --> Transacao: lista de transações
deactivate DB

Transacao --> Controller: transacoes
deactivate Transacao

note right of Controller
Mapeia transações como GASTO ou GANHO\nbaseado se userId é origem ou destino
end note

Controller --> Usuario: 200 OK\n[ { transacao, tipo: GASTO|GANHO }, ... ]
deactivate Controller
@enduml
```
