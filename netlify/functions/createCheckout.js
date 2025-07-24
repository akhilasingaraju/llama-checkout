const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PRICE_MAP = {
  '1502116725033': 'price_1RoU1NAWyMUmnKu5ALa3ffJk', // replace with your real product-lid and Stripe price
  //'987654321': 'price_def456',
  // add all products
};

exports.handler = async (event) => {
  const { quantity, productId } = JSON.parse(event.body);
  const priceId = PRICE_MAP[productId];

  if (!priceId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid product ID' }),
    };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: 'https://yourdomain.com/success',
      cancel_url: 'https://yourdomain.com/cancel',
      line_items: [{
        price: priceId,
        quantity: quantity || 1,
      }],
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
