// Mock email service
// In a production environment, this would integrate with an email service like SendGrid, AWS SES, etc.

export interface EmailParams {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    // In production, this would call an actual email service API
    console.log('[Email Service] Sending email:', {
      to: params.to,
      subject: params.subject,
      bodyPreview: params.body.substring(0, 100) + '...',
    });

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock successful email send
    console.log('[Email Service] Email sent successfully to:', params.to);
    return true;
  } catch (error) {
    console.error('[Email Service] Error sending email:', error);
    return false;
  }
}

export async function sendPublisherApprovalEmail(email: string, name: string): Promise<boolean> {
  const subject = 'Pagefy - Sua conta de publicador foi aprovada!';
  const body = `
Olá ${name},

Boas notícias! Sua solicitação para se tornar um publicador no Pagefy foi aprovada pelo administrador.

Você agora tem acesso ao Painel do Publicador, onde poderá:
- Gerenciar seus livros publicados
- Adicionar novos livros à plataforma
- Visualizar estatísticas de seus livros
- Interagir com leitores

Para acessar o Painel do Publicador, faça login na sua conta e acesse o menu principal.

Obrigado por fazer parte da comunidade Pagefy!

Atenciosamente,
Equipe Pagefy
  `.trim();

  return await sendEmail({ to: email, subject, body });
}

export async function sendPublisherRejectionEmail(email: string, name: string): Promise<boolean> {
  const subject = 'Pagefy - Status da sua solicitação de publicador';
  const body = `
Olá ${name},

Agradecemos seu interesse em se tornar um publicador no Pagefy.

Infelizmente, sua solicitação não pôde ser aprovada neste momento. Se você acredita que isso é um erro ou deseja mais informações, por favor entre em contato com nosso suporte em suporte@pagefy.com.

Você ainda pode continuar usando sua conta de leitor normalmente.

Atenciosamente,
Equipe Pagefy
  `.trim();

  return await sendEmail({ to: email, subject, body });
}

export async function sendAccountLockedEmail(email: string, name: string): Promise<boolean> {
  const subject = 'Pagefy - Sua conta foi temporariamente bloqueada';
  const body = `
Olá ${name},

Detectamos múltiplas tentativas de login sem sucesso em sua conta.

Por motivos de segurança, sua conta foi temporariamente bloqueada. Para desbloqueá-la, entre em contato com nosso suporte em suporte@pagefy.com.

Nossa equipe analisará sua solicitação e responderá o mais breve possível.

Atenciosamente,
Equipe Pagefy
  `.trim();

  return await sendEmail({ to: email, subject, body });
}

export async function sendAccountUnlockedEmail(email: string, name: string): Promise<boolean> {
  const subject = 'Pagefy - Sua conta foi desbloqueada';
  const body = `
Olá ${name},

Boas notícias! Sua conta no Pagefy foi desbloqueada pelo administrador.

Você já pode fazer login normalmente usando suas credenciais. As tentativas de login falhadas foram resetadas.

Se você teve problemas para lembrar sua senha, certifique-se de usar a senha correta da sua conta.

Se você não solicitou o desbloqueio ou tem dúvidas sobre a segurança da sua conta, entre em contato conosco em suporte@pagefy.com.

Atenciosamente,
Equipe Pagefy
  `.trim();

  return await sendEmail({ to: email, subject, body });
}
