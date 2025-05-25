module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    
    // Add to ConvertKit (example)
    // const response = await fetch('https://api.convertkit.com/v3/forms/YOUR_FORM_ID/subscribe', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     api_key: process.env.CONVERTKIT_API_KEY,
    //     email: email
    //   })
    // });

    // For now, just log it
    console.log('Captured email:', email);
    
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};