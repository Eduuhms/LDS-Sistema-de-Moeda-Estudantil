```code

@startuml
title Visualizar Vantagens - Fluxo MVC
autonumber 1.1

participant "VantagemController" as Controller
participant "VantagemModel" as Model
database "Banco de Dados" as DB

ref over Controller : Login obrigatório

Controller -> Model: buscarTodos()
activate Model

Model -> DB: SELECT * FROM vantagens
activate DB
DB --> Model: listaVantagens
deactivate DB

Model --> Controller: listaVantagens
deactivate Model
@enduml

```
