```code
@startuml
abstract class Usuario {
  - id: Int
  - nome: String
  - tipoUsuario: TipoUsuario
  - email: String
  - senha: String
  + autenticar(email: String, senha: String): boolean
}

class Aluno extends Usuario implements GerenciadorMoedas {
  - cpf: String
  - rg: String
  - endereco: String
  - curso: String
  - saldo: Int
  - instituicaoEnsino: InstituicaoEnsino
  + resgatarVantagem(vantagem: Vantagem): Resgate
  + receberMoedas(quantidade: Int, mensagem: String, professor: Professor): void
}

class Professor extends Usuario implements GerenciadorMoedas {
  - cpf: String
  - departamento: String
  - instituicaoEnsino: InstituicaoEnsino
  - saldo: Int
  + enviarMoedas(aluno: Aluno, quantidade: Int, mensagem: String): boolean
  + recarregarMoedasSemestrais(): void
}

class EmpresaParceira extends Usuario {
  - cnpj: String
  - descricao: String
  - endereco: String
  + cadastrarVantagem(vantagem: Vantagem): void
  + editarVantagem(vantagem: Vantagem): void
  + removerVantagem(vantagem: Vantagem): void
  + listarVantagens(): List<Vantagem>
}

class InstituicaoEnsino {
  - id: Int
  - nome: String
  - endereco: String
  - cnpj: String
  + adicionarProfessor(professor: Professor): void
  + listarProfessores(): List<Professor>
}

class Vantagem {
  - id: Int
  - nome: String
  - descricao: String
  - foto: String
  - custoMoedas: Int
  - empresaParceira: EmpresaParceira
}

class Transacao {
  - id: Int
  - dataHora: LocalDateTime
  - quantidade: Int
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
  - id: Int
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

enum TipoUsuario {
    aluno,
    professor,
    empresa
}

class EmailService {
  + enviarNotificacaoMoedas(aluno: Aluno, quantidade: Int, mensagem: String, professor: Professor): void
  + enviarNotificacaoResgate(resgate: Resgate): void
}

interface GerenciadorMoedas {
  + getSaldoMoedas(): Int
  + consultarExtrato(): List<Transacao>
  + possuiSaldoSuficiente(quantidade: Int): boolean
}

Aluno "n" -- "1" InstituicaoEnsino
Professor "n" -- "1" InstituicaoEnsino
Vantagem "n" -- "1" EmpresaParceira
Transacao "n" -- "2" Usuario
Resgate "n" -- "1" Aluno
Resgate "n" -- "1" Vantagem
@enduml

```