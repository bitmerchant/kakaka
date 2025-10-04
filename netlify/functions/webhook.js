// SDK do Mercado Pago
import { MercadoPagoConfig, Payment } from 'mercadopago';

// Adicione suas credenciais
// Substitua pelas suas credenciais de TESTE para testar, e depois pelas de PRODUÇÃO
const accessToken = process.env.MP_ACCESS_TOKEN;

// Inicializa o cliente do Mercado Pago
const client = new MercadoPagoConfig({ accessToken });
const payment = new Payment(client);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { body } = event;
    const notification = JSON.parse(body);

    // Verifica se é uma notificação de pagamento
    if (notification.type === 'payment' && notification.data && notification.data.id) {
      const paymentId = notification.data.id;
      console.log('Recebida notificação para o pagamento ID:', paymentId);

      // Busca os detalhes do pagamento na API do Mercado Pago
      const paymentInfo = await payment.get({ id: paymentId });

      console.log('Status do pagamento:', paymentInfo.status);

      // Se o pagamento foi aprovado, execute a ação desejada
      if (paymentInfo.status === 'approved') {
        console.log('Pagamento APROVADO. ID:', paymentId);

        // --- AÇÃO PÓS-PAGAMENTO ---
        // Aqui você deve implementar a lógica para liberar o produto/serviço.
        // Exemplos:
        // 1. Enviar um e-mail com o link de download.
        // 2. Gravar o acesso do usuário em um banco de dados.
        // 3. Chamar outra API para ativar um serviço.

        console.log(`Liberando acesso para o e-mail: ${paymentInfo.payer.email}`);
        // -------------------------
      }
    }

    // Responde ao Mercado Pago rapidamente com status 200 OK para confirmar o recebimento.
    return { statusCode: 200, body: 'OK' };

  } catch (error) {
    console.error('Erro no webhook do Mercado Pago:', error);
    // Mesmo em caso de erro, é uma boa prática retornar 200 para evitar que o MP reenvie a notificação incessantemente.
    // Monitore os logs da sua função para tratar os erros.
    return { statusCode: 200, body: 'OK' };
  }
};