import Translation from '../models/Translation.js';

export async function saveTranslation(req, res) {
  try {
    const { inputLanguage, outputLanguage, originalText, translatedText } = req.body;

    if (!inputLanguage || !outputLanguage || !originalText?.trim() || !translatedText?.trim()) {
      return res.status(400).json({ error: 'All translation fields are required' });
    }

    const entry = await Translation.create({
      userId: req.user._id,
      inputLanguage,
      outputLanguage,
      originalText: originalText.trim(),
      translatedText: translatedText.trim(),
    });

    return res.status(201).json({ translation: entry });
  } catch (err) {
    console.error('Save translation error:', err);
    return res.status(500).json({ error: 'Failed to save translation' });
  }
}

export async function getHistory(req, res) {
  try {
    const translations = await Translation.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({ translations });
  } catch (err) {
    console.error('Get history error:', err);
    return res.status(500).json({ error: 'Failed to load history' });
  }
}

export async function deleteTranslation(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Translation.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Translation not found' });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Delete translation error:', err);
    return res.status(500).json({ error: 'Failed to delete translation' });
  }
}

export async function clearHistory(req, res) {
  try {
    await Translation.deleteMany({ userId: req.user._id });
    return res.json({ success: true });
  } catch (err) {
    console.error('Clear history error:', err);
    return res.status(500).json({ error: 'Failed to clear history' });
  }
}

export async function translateText(req, res) {
  try {
    const { text, source_lang, target_lang } = req.body;

    if (!text?.trim() || !source_lang || !target_lang) {
      return res.status(400).json({ error: 'text, source_lang, and target_lang are required' });
    }

    const pythonApiUrl = process.env.PYTHON_API_URL;
    if (pythonApiUrl) {
      const response = await fetch(`${pythonApiUrl}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, source_lang, target_lang }),
      });
      if (!response.ok) {
        return res.status(502).json({ error: 'Translation service unavailable' });
      }
      const data = await response.json();
      const translated = data.translated_text;
      if (!translated?.trim()) {
        return res.status(502).json({ error: 'No translation returned' });
      }
      return res.json({ translated_text: translated });
    }

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source_lang}|${target_lang}`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(502).json({ error: 'Translation service unavailable' });
    }

    const data = await response.json();
    const translated = data.responseData?.translatedText;

    if (!translated?.trim()) {
      return res.status(502).json({ error: 'No translation returned' });
    }

    return res.json({ translated_text: translated });
  } catch (err) {
    console.error('Translate error:', err);
    return res.status(500).json({ error: 'Translation failed' });
  }
}
