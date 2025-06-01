```code

@startuml
title Cadastrar Vantagens(Empresa Parceira)

participant "VantagemController" as Controller
participant "VantagemModel" as Model
database "Banco de Dados" as DB

ref over Controller : Login obrigatório\n(verificação de sessão/autenticação)

== Criar Vantagem ==
autonumber 1.1
Controller -> Model: criar(dados)
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

Model -> DB: INSERT INTO vantagens\n(dados)\nVALUES (valores)
activate DB
DB --> Model: ID gerado
deactivate DB

Model --> Controller: insertId
deactivate Model

== Listar Vantagens ==
autonumber 2.1
Controller -> Model: buscarTodas(empresaId)
activate Model

Model -> DB: SELECT * FROM vantagens\nWHERE empresa_id = ?
activate DB
DB --> Model: listaVantagens
deactivate DB

Model --> Controller: listaVantagens
deactivate Model

== Atualizar Vantagem ==
autonumber 3.1
Controller -> Model: atualizar(dados)
activate Model

Model -> DB: UPDATE vantagens SET\n(dados)\nWHERE id = ? AND empresa_id = ?
activate DB
DB --> Model: sucesso ou erro
deactivate DB

Model --> Controller: resultado da atualização
deactivate Model

== Excluir Vantagem ==
autonumber 4.1
Controller -> Model: excluir(dados)
activate Model

Model -> DB: DELETE FROM vantagens\nWHERE id = ? AND empresa_id = ?
activate DB
DB --> Model: sucesso ou erro
deactivate DB

Model --> Controller: resultado da exclusão
deactivate Model
@enduml

```