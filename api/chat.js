export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is missing in Vercel settings.' });
  }

  try {
    const { userMessage } = req.body;
    
    // Updated URL to use the most recent model identifier
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ 
            text: `System: You are ARIA, a warm voice receptionist. Keep responses to 2 short sentences. No markdown. \n\n User: ${userMessage}` 
          }]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini Error:", data);
      return res.status(response.status).json({ error: data.error?.message || "Gemini Error" });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that.";
    res.status(200).json({ reply });

  } catch (err) {
    console.error("Server Crash:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
