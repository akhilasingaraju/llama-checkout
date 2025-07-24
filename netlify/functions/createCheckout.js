const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Map your product LIDs (from Tilda) to Stripe Price IDs
const PRICE_MAP = {
  '376328752612': 'price_1RoU1NAWyMUmnKu5ALa3ffJk', // example
  '608434923522': 'price_1RoDF0AWyMUmnKu5gxhyOFk5',
  '923338722632': 'price_1RoDDNAWyMUmnKu5Nm0wmfqB',
  // Add more product LIDs and Stripe Price IDs here
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
