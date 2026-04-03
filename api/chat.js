export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userMessage } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    // Gemini API expects the key as a URL parameter
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ 
            text: `System: You are ARIA, a warm, gracious AI voice receptionist. Keep every response to 2-3 short sentences maximum. No markdown, no bullet points, no asterisks — plain spoken sentences only. \n\n User: ${userMessage}` 
          }]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error Details:", data);
      return res.status(response.status).json({ error: data.error?.message || "Gemini API Error" });
    }

    // Navigate Gemini's response structure to get the text
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";
    
    res.status(200).json({ reply });

  } catch (err) {
    console.error('Server-side error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
