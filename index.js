require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const https = require('https');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Инициализация на OpenAI клиента
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Главен endpoint за генериране на приказки
app.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt in request body.' });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a fairytale writer for children.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
    });

    const story = response.choices[0].message.content;
    res.json({ story });
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    res.status(500).json({ error: 'Failed to generate story.' });
  }
});

// Нов endpoint: генериране на аудио с ElevenLabs
app.post('/audio', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Missing text in request body.' });
  }

  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Може да се смени с друг

    const options = {
      hostname: 'api.elevenlabs.io',
      path: `/v1/text-to-speech/${voiceId}`,
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'accept': 'audio/mpeg',
      }
    };

    const requestData = JSON.stringify({
      text: text,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.4,
        similarity_boost: 0.8
      }
    });

    const audioChunks = [];

    const apiReq = https.request(options, apiRes => {
      apiRes.on('data', chunk => audioChunks.push(chunk));
      apiRes.on('end', () => {
        const audioBuffer = Buffer.concat(audioChunks);
        res.set({
          'Content-Type': 'audio/mpeg',
          'Content-Disposition': 'attachment; filename="story.mp3"',
        });
        res.send(audioBuffer);
      });
    });

    apiReq.on('error', error => {
      console.error('ElevenLabs error:', error);
      res.status(500).json({ error: 'Failed to generate audio.' });
    });

    apiReq.write(requestData);
    apiReq.end();
  } catch (error) {
    console.error('Audio generation error:', error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Тестов GET endpoint за Render health check
app.get('/', (req, res) => {
  res.send('Malvina backend is running.');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
