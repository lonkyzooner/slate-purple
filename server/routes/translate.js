const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

router.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    console.log(`[Translate] Translating to ${targetLanguage}: ${text}`);

    if (!GOOGLE_TRANSLATE_API_KEY) {
      return res.status(500).json({ error: 'Translation API key not configured' });
    }

    const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        target: targetLanguage,
        format: 'text',
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('[Translate] API error:', data.error);
      return res.status(500).json({ error: 'Translation API error' });
    }

    const translatedText = data.data.translations[0].translatedText;
    res.json({ translatedText });
  } catch (err) {
    console.error('[Translate] Error:', err);
    res.status(500).json({ error: 'Translation failed' });
  }
});

module.exports = router;