// SDK do Mercado Pago
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Adicione suas credenciais
// Substitua pelas suas credenciais de TESTE para testar, e depois pelas de PRODUÇÃO
const accessToken = process.env.MP_ACCESS_TOKEN;

// Inicializa o cliente do Mercado Pago
const client = new MercadoPagoConfig({ accessToken });

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { produto, valor, email, origin } = JSON.parse(event.body);

    if (!produto || !valor || !email || !origin) {
      return { statusCode: 400, body: 'Missing required fields' };
    }

    const preference = new Preference(client);

    const preferenceData = {
      body: {
        items: [
          {
            title: produto,
            quantity: 1,
            unit_price: valor,
          },
        ],
        payer: {
          email: email,
        },
        back_urls: {
          success: `${origin}/?payment_success=true`, // URL de sucesso (opcional)
        },
        auto_return: 'approved',
        // A notification_url é o webhook que o Mercado Pago chamará
        notification_url: `${origin}/.netlify/functions/webhook`,
      }
    };

    const result = await preference.create(preferenceData);

    return {
      statusCode: 200,
      body: JSON.stringify({ preferenceId: result.id }),
    };
  } catch (error) {
    console.error('Error creating preference:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create preference' }),
    };
  }
};