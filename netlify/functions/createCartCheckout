const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    // Handle preflight
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: 'Preflight OK',
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { cartItems, domain } = body;

    const lineItems = cartItems.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description,
          images: item.images || [],
          metadata: { product_id: item.id }
        },
        unit_amount: Math.round(item.price * 100)
      },
      quantity: item.quantity
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link'],
      line_items: lineItems,
      mode: 'payment',
      billing_address_collection: 'required',
      shipping_address_collection: { allowed_countries: ['US', 'CA'] },
      success_url: `${domain}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/cancel`,
      metadata: { order_id: body.orderId || 'no-order-id' }
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',  // <-- Key CORS fix
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ sessionId: session.id, url: session.url })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ error: err.message })
    };
  }
};
