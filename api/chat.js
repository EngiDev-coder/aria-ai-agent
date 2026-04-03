export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is missing.' });
  }

  try {
    const { userMessage } = req.body;
    
    // CHANGED: Use 'gemini-1.5-flash' instead of 'gemini-1.5-flash-latest'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ 
            text: `System: You are ARIA, a warm voice receptionist. Keep responses to 2 short sentences. No markdown or special formatting. \n\n User: ${userMessage}` 
          }]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Detailed Error:", data);
      return res.status(response.status).json({ error: data.error?.message || "Gemini API Error" });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";
    res.status(200).json({ reply });

  } catch (err) {
    console.error("Server-side crash:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
