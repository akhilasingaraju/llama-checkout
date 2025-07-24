const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { cartItems, domain = "https://project14002159.tilda.ws", orderId } = body;

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
        unit_amount: Math.round(item.price * 100), // price in cents
      },
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link'],
      mode: 'payment',
      line_items: lineItems,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      success_url: `${domain}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/cancel`,
      metadata: {
        order_id: orderId || 'none',
      },
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ sessionId: session.id, url: session.url }),
    };
  } catch (error) {
    console.error("❌ Stripe error:", error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
