```code

@startuml

abstract class Usuario {
  - nome: String
  - email: String
  - senha: String
  + autenticar(email: String, senha: String): boolean
}

class Aluno extends Usuario implements GerenciadorMoedas  {
  - cpf: String
  - rg: String
  - endereco: String
  - curso: String
  - saldoMoedas: Integer
  - instituicaoEnsino: InstituicaoEnsino
  + resgatarVantagem(vantagem: Vantagem): Resgate
  + receberMoedas(quantidade: Integer, mensagem: String, professor: Professor): void
}

class Professor extends Usuario implements GerenciadorMoedas  {
  - cpf: String
  - departamento: String
  - instituicaoEnsino: InstituicaoEnsino
  - saldoMoedas: Integer
  + enviarMoedas(aluno: Aluno, quantidade: Integer, mensagem: String): boolean
  + recarregarMoedasSemestrais(): void
}

class EmpresaParceira extends Usuario {
  - cnpj: String
  - descricao: String
  - enderecoFisico: String
  + cadastrarVantagem(vantagem: Vantagem): void
  + editarVantagem(vantagem: Vantagem): void
  + removerVantagem(vantagem: Vantagem): void
  + listarVantagens(): List<Vantagem>
}

class InstituicaoEnsino {
  - nome: String
  - endereco: String
  - cnpj: String
  + adicionarProfessor(professor: Professor): void
  + listarProfessores(): List<Professor>
}

class Vantagem {
  - nome: String
  - descricao: String
  - foto: String
  - custoMoedas: Integer
  - empresaParceira: EmpresaParceira
}

class Transacao {
  - dataHora: LocalDateTime
  - quantidade: Integer
  - mensagem: String
  - origem: Usuario
  - destino: Usuario
  - tipoTransacao: TipoTransacao
}

enum TipoTransacao {
  ENVIO_PROFESSOR,
  RECEBIMENTO_ALUNO,
  TROCA_VANTAGEM
}

class Resgate {
  - dataHora: LocalDateTime
  - aluno: Aluno
  - vantagem: Vantagem
  - codigo: String
  - status: StatusResgate
  + gerarCodigo(): String
  + enviarEmailAluno(): void
  + enviarEmailEmpresa(): void
}

enum StatusResgate {
  PENDENTE,
  UTILIZADO,
  EXPIRADO
}

class EmailService {
  + enviarNotificacaoMoedas(aluno: Aluno, quantidade: Integer, mensagem: String, professor: Professor): void
  + enviarNotificacaoResgate(resgate: Resgate): void
}

interface GerenciadorMoedas {
  + getSaldoMoedas(): Integer
  + consultarExtrato(): List<Transacao>
  + possuiSaldoSuficiente(quantidade: Integer): boolean
}

Aluno "n" -- "1" InstituicaoEnsino
Professor "n" -- "1" InstituicaoEnsino
Vantagem "n" -- "1" EmpresaParceira
Transacao "n" -- "2" Usuario
Resgate "n" -- "1" Aluno
Resgate "n" -- "1" Vantagem

@enduml

```