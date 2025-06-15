const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async enviarEmailResgate(emailAluno, codigoResgate, vantagem) {
        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: emailAluno,
                subject: 'Código do Resgate - Sistema de Moeda Estudantil',
                html: `
                    <h1>Seu código de resgate está aqui!</h1>
                    <p>Olá! Você realizou o resgate da vantagem: <strong>${vantagem.nome}</strong></p>
                    <p>Seu código de resgate é: <strong>${codigoResgate}</strong></p>
                    <p>Apresente este código ao parceiro para resgatar sua vantagem.</p>
                    <br>
                    <p>Atenciosamente,</p>
                    <p>Equipe do Sistema de Moeda Estudantil</p>
                `
            });
            return true;
        } catch (error) {
            console.error('Erro ao enviar e-mail:', error);
            return false;
        }
    }

    async enviarEmailResgateEmpresa(emailEmpresa, codigoResgate, vantagem, nomeAluno) {
        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: emailEmpresa,
                subject: 'Nova Vantagem Resgatada - Sistema de Moeda Estudantil',
                html: `
                    <h1>Nova Vantagem Resgatada!</h1>
                    <p>Olá! Um aluno resgatou uma de suas vantagens:</p>
                    <ul>
                        <li>Vantagem: <strong>${vantagem.nome}</strong></li>
                        <li>Aluno: <strong>${nomeAluno}</strong></li>
                        <li>Código de resgate: <strong>${codigoResgate}</strong></li>
                    </ul>
                    <p>Verifique se o código apresentado pelo aluno corresponde ao código acima.</p>
                    <br>
                    <p>Atenciosamente,</p>
                    <p>Equipe do Sistema de Moeda Estudantil</p>
                `
            });
            return true;
        } catch (error) {
            console.error('Erro ao enviar e-mail para empresa:', error);
            return false;
        }
    }
}

module.exports = new EmailService(); 