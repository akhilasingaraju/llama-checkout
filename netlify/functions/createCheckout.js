
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Flat price and mode maps
const PRICE_MAP = {
  '1502117342481': 'price_1RoDF0AWyMUmnKu5gxhyOFk5', // Ratnagiri 6
  '1497456130776': 'price_1RoX0zAWyMUmnKu5CHcm0jDD', // Odisha 12
  '1753306324781': 'price_1RoX3mAWyMUmnKu5udLvtytF', // The Mango Drop (subscription)
  '1753307345199': 'price_1RoX2IAWyMUmnKu5g7IeEPo4', // Heritage Mango Fire
  '1502116725033': 'price_1RoU1NAWyMUmnKu5ALa3ffJk', // Sunrise Preserve
  '1753311223047': 'price_1RoDDNAWyMUmnKu5Nm0wmfqB', // Llama Magazine (subscription)
  '1753307678371': 'price_1RoX4uAWyMUmnKu5ES4CKCAC', // Mango Body Oil
};

const MODE_MAP = {
  '1753306324781': 'subscription', // The Mango Drop
  '1753311223047': 'subscription', // Llama Magazine
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: 'Preflight OK',
    };
  }

  try {
    const { productId, quantity } = JSON.parse(event.body);
    const priceId = PRICE_MAP[productId];
    const mode = MODE_MAP[productId] || 'payment';

    if (!priceId) {
      console.error("Unknown productId:", productId);
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Unknown productId' }),
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link'],
      mode,
      line_items: [
        {
          price: priceId,
          quantity: quantity || 1,
        },
      ],
      success_url: 'https://project14002159.tilda.ws/thank-you',
      cancel_url: 'https://project14002159.tilda.ws/',
    });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    console.error("Stripe error:", error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
