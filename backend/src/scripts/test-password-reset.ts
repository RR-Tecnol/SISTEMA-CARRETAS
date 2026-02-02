import dotenv from 'dotenv';
import path from 'path';
import { sendPasswordResetEmail } from '../utils/email';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function testPasswordResetEmail() {
    const logFile = path.join(__dirname, '../../test-email-result.txt');
    const log = (msg: string) => {
        console.log(msg);
        fs.appendFileSync(logFile, msg + '\n');
    };

    // Clear previous log
    if (fs.existsSync(logFile)) {
        fs.unlinkSync(logFile);
    }

    log('='.repeat(60));
    log('🧪 TESTE DE EMAIL DE REDEFINIÇÃO DE SENHA');
    log('='.repeat(60));
    log('');

    // Test email - Using SMTP user email for testing
    const testEmail = process.env.SMTP_USER || 'a11f6b001@smtp-brevo.com';
    const testToken = 'test-token-' + Math.random().toString(36).substring(7);

    log(`📧 Destinatário: ${testEmail}`);
    log(`🔑 Token gerado: ${testToken}`);
    log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    log(`📤 Servidor SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
    log('');
    log('Enviando email...');
    log('');

    try {
        const result = await sendPasswordResetEmail(testEmail, testToken);
        log('✅ EMAIL ENVIADO COM SUCESSO!');
        log('');
        log(`📬 Verifique a caixa de entrada de: ${testEmail}`);
        log(`🔗 O email contém um link para: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/redefinir-senha?token=${testToken}`);
        log('');
        log(`Message ID: ${result.messageId}`);
        log('');
        log('='.repeat(60));
        log(`Log salvo em: ${logFile}`);
        log('='.repeat(60));
    } catch (error: any) {
        log('❌ FALHA AO ENVIAR EMAIL');
        log('');
        log(`Erro: ${error.message}`);
        log('');
        log('Detalhes completos:');
        log(JSON.stringify(error, null, 2));
        log('');
        log('='.repeat(60));
        log(`Log de erro salvo em: ${logFile}`);
        log('='.repeat(60));
    }
}

testPasswordResetEmail();
