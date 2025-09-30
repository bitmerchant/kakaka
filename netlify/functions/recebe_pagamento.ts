import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import * as crypto from 'crypto';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // 1. Verify the request is a POST request
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: { 'Allow': 'POST' }
    };
  }

  // 2. Get the secret key from environment variables
  const yampiSecretKey = process.env.YAMPI_SECRET_KEY;
  if (!yampiSecretKey) {
    console.error('Yampi secret key is not set in environment variables.');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error: Missing secret key' })
    };
  }

  // 3. Validate the webhook signature
  const signature = event.headers['x-yampi-signature'];
  if (!signature) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Bad Request: Missing signature' })
    };
  }

  const hmac = crypto.createHmac('sha256', yampiSecretKey);
  const calculatedSignature = hmac.update(event.body!).digest('hex');

  const isSignatureValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(calculatedSignature));

  if (!isSignatureValid) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized: Invalid signature' })
    };
  }

  // 4. Process the webhook event
  try {
    const payload = JSON.parse(event.body!);
    const eventType = payload.event;
    const data = payload.data;

    console.log(`Received Yampi webhook. Event: ${eventType}`, data);

    switch (eventType) {
      case 'order.approved':
        // This is the most important event for fulfillment.
        const orderId = data.order.id;
        console.log(`✅ Order approved! Order ID: ${orderId}. Preparing to process...`);
        // TODO: Add your business logic here, e.g., update a database, grant user access, etc.
        // For now, we'll just log it.
        break;

      case 'order.created':
        console.log(`🔔 New order created. Order ID: ${data.order.id}.`);
        break;

      case 'payment.denied':
        console.log(`❌ Payment denied for order ID: ${data.order.id}. Reason: ${data.payment.gateway_message}`);
        break;

      default:
        console.log(`Received unhandled event type: ${eventType}`);
    }

    // 5. Return a 200 OK response to Yampi
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Webhook received successfully' })
    };

  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Bad Request: Could not parse JSON body' })
    };
  }
};

export { handler };