```code

@startuml
node "Computador do usuário" as user_computer {
  component "Navegador" as browser
}

node "Servidor de aplicação" as app_server {
  component "Frontend" as frontend
  component "BackEnd" as back
}

node "Database" as db_storage{
  component "Banco de dados" as bd
}

browser ..> frontend
user_computer --> app_server : HTTPS
frontend ..> back
back ..> bd
app_server --> db_storage
@enduml


```