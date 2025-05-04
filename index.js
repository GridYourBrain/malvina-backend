require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt in request body.' });
    }

    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a fairytale writer for children.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
    });

    const story = response.data.choices[0].message.content;
    res.json({ story });
  } catch (error) {
    console.error('OpenAI error:', error.message);
    res.status(500).json({ error: 'Error generating story.' });
  }
});

app.get('/', (req, res) => {
  res.send('Malvina backend is running.');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
