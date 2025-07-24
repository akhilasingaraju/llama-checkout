const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Map data-product-lid (from Tilda HTML) to Stripe Price IDs
const PRICE_MAP = {
  // One-time purchase products (mode: 'payment')
  '1502117342481': { priceId: 'price_1RoDF0AWyMUmnKu5gxhyOFk5', mode: 'payment' }, // Ratnagiri 6
  '1497456130776': { priceId: 'price_1RoX0zAWyMUmnKu5CHcm0jDD', mode: 'payment' }, // Odisha 12
  '1753307345199': { priceId: 'price_1RoX2IAWyMUmnKu5g7IeEPo4', mode: 'payment' }, // Heritage Mango Fire
  '1502116725033': { priceId: 'price_1RoU1NAWyMUmnKu5ALa3ffJk', mode: 'payment' }, // Sunrise Preserve
  '1753307678371': { priceId: 'price_1RoX4uAWyMUmnKu5ES4CKCAC', mode: 'payment' }, // Mango Body Oil

  // Subscription products (mode: 'subscription')
  '1753306324781': { priceId: 'price_1RoX3mAWyMUmnKu5udLvtytF', mode: 'subscription' }, // The Mango Drop
  '1753311223047': { priceId: 'price_1RoDDNAWyMUmnKu5Nm0wmfqB', mode: 'subscription' }, // Llama Magazine
};

exports.handler = async (event, context) => {
  // Handle preflight CORS request
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
    console.info("🔥 Received productId:", productId);
    console.info("🧮 Received quantity:", quantity);

    const priceId = PRICE_MAP[productId];
    if (!priceId) {
      console.error("❌ Unknown productId:", productId);
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Unknown productId' }),
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link'],
      mode: 'payment',
      line_items: [{
        price: priceId,
        quantity: quantity || 1,
      }],
      success_url: 'https://project14002159.tilda.ws/thank-you',
      cancel_url: 'https://project14002159.tilda.ws/',
    });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    console.error('Stripe error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
