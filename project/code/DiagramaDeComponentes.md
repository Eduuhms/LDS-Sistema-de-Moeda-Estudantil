```code

@startuml
component "Navegador Web" as Web

component "FrontEnd" as FrontEnd

component "Backend" as Backend {
  component "Autenticação"
  component "Gerenciamento de Usuário"
  component "Gerenciamento de Vantagem"
  component "Gerenciamento de Transações"
  component "Gerenciamento de Resgates"
}

component "Banco de dados" as BD {
  component "Aluno"
  component "Professor"
  component "EmpresaParceira"
  component "InstituicaoEnsino"
  component "Vantagem"
  component "Transacao"
}

Web ..> FrontEnd
FrontEnd ..> Backend : HTTPS
Backend ..> BD
@enduml


```