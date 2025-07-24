const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Map your product LIDs (from Tilda) to Stripe Price IDs
const PRICE_MAP = {
  '608434923522': 'price_1RoDF0AWyMUmnKu5gxhyOFk5', // Ratnagiri 6
  '912790715332': 'price_1RoX0zAWyMUmnKu5CHcm0jDD', // Odisha 12
  '889145261572': 'price_1RoX3mAWyMUmnKu5udLvtytF', // The Mango Drop
  '867258767462': 'price_1RoX2IAWyMUmnKu5g7IeEPo4', // Heritage Mango Fire
  '376328752612': 'price_1RoU1NAWyMUmnKu5ALa3ffJk', // Sunrise Preserve
  '923338722632': 'price_1RoDDNAWyMUmnKu5Nm0wmfqB', // Llama Magazine
  '198526285452': 'price_1RoX4uAWyMUmnKu5ES4CKCAC', // Mango Body Oil
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

    const priceId = PRICE_MAP[productId];
    if (!priceId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Unknown productId' }),
      };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link'],
      mode: 'payment',
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
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    console.error('Stripe error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
