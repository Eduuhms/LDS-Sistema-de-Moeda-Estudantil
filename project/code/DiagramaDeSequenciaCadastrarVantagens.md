```code

@startuml
title CRUD de Vantagens - Fluxo MVC com Login (Empresa Parceira)

actor "Empresa Parceira" as Empresa
participant "VantagemController" as Controller
participant "VantagemModel" as Model
database "Banco de Dados" as DB

ref over Empresa, Controller : Login obrigatório\n(verificação de sessão/autenticação)

== Criar Vantagem ==
autonumber 1.1
Empresa -> Controller: POST /vantagens/cadastrar\n(nome, descricao, foto, custoMoedas)
activate Controller

Controller -> Model: criar(dados da vantagem + empresaId da sessão)
activate Model
note right of Controller
dados = {
  nome,
  descricao,
  foto,
  custoMoedas,
  empresaId
}
end note

Model -> DB: INSERT INTO vantagens\n(nome, descricao, foto, custo_moedas, empresa_id)\nVALUES (valores)
activate DB
DB --> Model: ID gerado
deactivate DB

Model --> Controller: insertId
deactivate Model

Controller --> Empresa: 201 Created\n{id, nome, custoMoedas}
deactivate Controller

== Listar Vantagens ==
autonumber 2.1
Empresa -> Controller: GET /vantagens
activate Controller

Controller -> Model: buscarTodas(empresaId da sessão)
activate Model

Model -> DB: SELECT * FROM vantagens\nWHERE empresa_id = ?
activate DB
DB --> Model: listaVantagens
deactivate DB

Model --> Controller: listaVantagens
deactivate Model

Controller --> Empresa: 200 OK\n[ { id, nome, descricao, custoMoedas, foto }, ... ]
deactivate Controller

== Atualizar Vantagem ==
autonumber 3.1
Empresa -> Controller: PUT /vantagens/:id\n(dados atualizados)
activate Controller

Controller -> Model: atualizar(id, dados, empresaId da sessão)
activate Model

Model -> DB: UPDATE vantagens SET\n(dados)\nWHERE id = ? AND empresa_id = ?
activate DB
DB --> Model: sucesso ou erro
deactivate DB

Model --> Controller: resultado da atualização
deactivate Model

Controller --> Empresa: 200 OK ou 403 Forbidden
deactivate Controller

== Excluir Vantagem ==
autonumber 4.1
Empresa -> Controller: DELETE /vantagens/:id
activate Controller

Controller -> Model: excluir(id, empresaId da sessão)
activate Model

Model -> DB: DELETE FROM vantagens\nWHERE id = ? AND empresa_id = ?
activate DB
DB --> Model: sucesso ou erro
deactivate DB

Model --> Controller: resultado da exclusão
deactivate Model

Controller --> Empresa: 200 OK ou 403 Forbidden
deactivate Controller
@enduml

```