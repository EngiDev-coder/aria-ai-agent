export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userMessage } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    // Gemini requires the API key in the URL string
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ 
            text: `System: You are ARIA, a warm, gracious AI voice receptionist. Keep every response to 2-3 short sentences maximum. No markdown, no asterisks — plain spoken sentences only. \n\n User: ${userMessage}` 
          }]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return res.status(response.status).json({ error: data.error?.message || "Gemini API Error" });
    }

    // Extract text from Gemini's specific JSON structure
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";
    
    res.status(200).json({ reply });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
