const stripe = require('stripe')('sk_test_your_key'); // replace with your real Stripe secret key

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*', // allow requests from any domain
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    // Handle preflight request
    return {
      statusCode: 200,
      headers,
      body: 'Preflight OK',
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { cartItems, domain, orderId } = body;

    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description || '',
          images: item.images || [],
          metadata: {
            product_id: item.id,
          },
        },
        unit_amount: Math.round(item.price * 100), // cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link'],
      line_items: lineItems,
      mode: 'payment',
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      success_url: `${domain}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/cancel`,
      metadata: {
        order_id: orderId || '',
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ sessionId: session.id, url: session.url }),
    };
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
