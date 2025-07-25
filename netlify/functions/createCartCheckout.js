const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    console.log("🔥 createCartCheckout called");

    if (!event.body) {
      console.error("❌ No body received");
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({ error: "No request body found" })
      };
    }

    let body;
    try {
      body = JSON.parse(event.body);
    } catch (err) {
      console.error("❌ Error parsing JSON body:", event.body);
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({ error: "Invalid JSON format" })
      };
    }

    const { cartItems, domain } = body;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      console.error("❌ Cart is empty or invalid");
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({ error: "Cart is empty or invalid" })
      };
    }

    console.log("🧺 Cart Items:", cartItems);

    const line_items = cartItems.map((item) => ({
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(item.price * 100), // price in cents
        product_data: {
          name: item.name,
          images: item.images || [],
          description: item.description || ''
        }
      },
      quantity: item.quantity
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link'],
      line_items,
      mode: 'payment',
      success_url: `${domain}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/cancel`,
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA']
      }
    });

    console.log("✅ Stripe session created:", session.url);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ url: session.url })
    };
  } catch (err) {
    console.error("💥 Stripe error:", err);

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
