```code

@startuml
title Visualizar Vantagens - Fluxo MVC
autonumber 1.1

actor "Aluno" as Aluno
participant "VantagemController" as Controller
participant "VantagemModel" as Model
database "Banco de Dados" as DB

ref over Aluno, Controller: Login obrigatório

Aluno -> Controller: GET /vantagens/listar
activate Controller

Controller -> Model: buscarTodos()
activate Model

Model -> DB: SELECT * FROM vantagens
activate DB
DB --> Model: listaVantagens
deactivate DB

Model --> Controller: listaVantagens
deactivate Model

Controller --> Aluno: 200 OK\n(lista de vantagens)
deactivate Controller
@enduml

```
