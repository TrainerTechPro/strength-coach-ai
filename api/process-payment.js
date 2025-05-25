const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

// Configure email (using Gmail as example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { payment_method_id, email, name, amount, order_bump } = req.body;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents ($47 = 4700)
      currency: 'usd',
      payment_method: payment_method_id,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
      metadata: {
        email: email,
        name: name,
        order_bump: order_bump ? 'yes' : 'no'
      }
    });

    if (paymentIntent.status === 'succeeded') {
      // Send the digital product email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your ChatGPT Strength Coach System is Here! 🎉',
        html: `
          <h2>Hi ${name}!</h2>
          <p>Thank you for your purchase of the ChatGPT Strength Coach System${order_bump ? ' + Nutrition Pack' : ''}!</p>
          <p><strong>Download your files here:</strong></p>
          <p><a href="${process.env.DOWNLOAD_LINK}" style="background: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Download Now</a></p>
          ${order_bump ? `<p><a href="${process.env.NUTRITION_DOWNLOAD_LINK}">Download Nutrition Pack</a></p>` : ''}
          <p>If you have any questions, reply to this email!</p>
          <p>Best,<br>Tony Sommers</p>
        `
      };

      await transporter.sendMail(mailOptions);

      res.json({ success: true });
    } else {
      res.json({ success: false, error: 'Payment failed' });
    }
  } catch (error) {
    console.error('Payment error:', error);
    res.json({ success: false, error: error.message });
  }
};