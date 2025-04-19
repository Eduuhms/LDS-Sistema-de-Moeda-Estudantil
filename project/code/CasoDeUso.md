```code

    @startuml
    left to right direction
    skinparam packageStyle rectangle

    actor Usuário
    actor Aluno
    actor Professor
    actor EmpresaParceira

    Usuário <|-- Aluno
    Usuário <|-- Professor
    Usuário <|-- EmpresaParceira

    rectangle "Sistema de Mérito Acadêmico" {

        usecase "Cadastrar-se" as UC1
        usecase "Fazer login" as UC2
        usecase "Consultar extrato" as UC3
        usecase "Enviar moedas" as UC4
        usecase "Notificar aluno por email" as UC5
        usecase "Trocar moedas por vantagem" as UC7
        usecase "Notificar resgate por email" as UC8
        usecase "Gerenciar vantagens" as UC10
        usecase "Visualizar saldo de moedas" as UC11

        Usuário --> UC1
        Usuário --> UC2
        Aluno --> UC3
        Aluno --> UC7
        Aluno --> UC11
        Professor --> UC3
        Professor --> UC4
        Professor --> UC11
        EmpresaParceira --> UC10

        UC4 --> UC5 : <<include>>
        UC7 --> UC8 : <<include>>
    }
    @enduml


```