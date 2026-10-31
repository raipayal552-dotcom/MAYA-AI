require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    assistant: 'MAYA',
    apiKeyConfigured: Boolean(apiKey)
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY मिलेन।'
      });
    }

    const message = req.body?.message;

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        error: 'कृपया सन्देश लेख्नुहोस्।'
      });
    }

    const text = message.trim().toLowerCase();
    if (/^hi[!. ]*$/.test(text)) {
      return res.json({ reply: "Hi! 😊 म MAYA हुँ। तपाईंलाई कस्तो छ?" });
    }

    if (/^(hello|hey)[!. ]*$/.test(text)) {
      return res.json({ reply: "Hello! 👋 MAYA यहाँ छे। आज म तपाईंलाई के सहयोग गरूँ?" });
    }

    if (/^(namaste|नमस्ते|हेलो)[!. ]*$/.test(text)) {
      return res.json({ reply: "नमस्ते! 🙏 स्वागत छ। तपाईंलाई के सहयोग गरूँ?" });
    }

    if (/^(तिम्रो नाम के हो\?|मेरो नाम के हो\?|what is your name\??)$/i.test(text)) {
      return res.json({ reply: "मेरो नाम MAYA हो। 😊" });
    }

    if (/^(तिमी को हौ\?|तपाईं को हुनुहुन्छ\?|who are you\??)$/i.test(text)) {
      return res.json({ reply: "म तपाईंको AI सहायक MAYA हुँ। 😊" });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: message.trim(),
      config: {
        systemInstruction:
          "You are MAYA, a friendly and helpful AI assistant. Always speak naturally in Nepali using Devanagari script. Answer the user's actual message directly. Do not repeat greetings or say I am ready start talking to me unless the user specifically asks for that. Keep the conversation flowing naturally and ask a relevant follow-up question when appropriate."
      }
    });

    res.json({
      reply: response.text || 'अहिले जवाफ आएन।'
    });
  } catch (error) {
    const msg = String(error.message || '');
    if (error.status === 429 || msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({ error: 'MAYA को AI अनुरोध सीमा सकिएको छ। केही समयपछि फेरि प्रयास गर्नुहोस्।' });
    }
    res.status(500).json({ error: 'जवाफ ल्याउन समस्या भयो।' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MAYA server running on port ${PORT}`);
});


