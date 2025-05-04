require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

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

// Тестов GET endpoint за Render health check
app.get('/', (req, res) => {
  res.send('Malvina backend is running.');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
