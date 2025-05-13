```code

   @startuml
left to right direction
skinparam packageStyle rectangle

actor Usuário
actor Membro
actor Aluno
actor Professor
actor EmpresaParceira
actor UsuárioInstitucional

Usuário <|-- Membro
Membro <|-- Aluno
Membro <|-- Professor
Usuário <|-- EmpresaParceira
Usuário <|-- UsuárioInstitucional

rectangle "Sistema de Mérito Acadêmico" {

    usecase "Cadastrar-se" as UC1
    usecase "Fazer login" as UC2
    usecase "Consultar extrato" as UC3
    usecase "Enviar moedas" as UC4
    usecase "Trocar moedas por vantagem" as UC7
    usecase "Notificar via email" as UC8
    usecase "Gerenciar vantagens" as UC10
    usecase "Visualizar saldo de moedas" as UC11
    usecase "Enviar moedas para professor" as UC12

    Usuário --> UC1
    Usuário --> UC2
    Membro --> UC3
    Membro --> UC11
    Aluno --> UC7
    Professor --> UC4
    EmpresaParceira --> UC10
    UsuárioInstitucional --> UC12

    UC4 --> UC8 : <<include>>
    UC7 --> UC8 : <<include>>
    UC12 --> UC8 : <<include>>
}
@enduml

```