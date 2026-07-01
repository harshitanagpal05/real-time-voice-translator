import Translation from '../models/Translation.js';

export async function saveTranslation(req, res) {
  try {
    const { inputLanguage, outputLanguage, originalText, translatedText, translationType } = req.body;

    if (!inputLanguage || !outputLanguage || !originalText?.trim() || !translatedText?.trim()) {
      return res.status(400).json({ error: 'All translation fields are required' });
    }

    const entry = await Translation.create({
      userId: req.user._id,
      inputLanguage,
      outputLanguage,
      originalText: originalText.trim(),
      translatedText: translatedText.trim(),
      translationType: translationType === 'voice' ? 'voice' : 'text',
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

export async function getAnalytics(req, res) {
  try {
    const userId = req.user._id;

    // Total count
    const totalTranslations = await Translation.countDocuments({ userId });

    if (totalTranslations === 0) {
      return res.json({
        totalTranslations: 0,
        voiceCount: 0,
        textCount: 0,
        topSourceLang: null,
        topTargetLang: null,
        topLangPair: null,
        dailyCounts: [],
        weeklyCounts: [],
        monthlyCounts: [],
        recentActivity: [],
      });
    }

    // Voice vs Text
    const typeCounts = await Translation.aggregate([
      { $match: { userId } },
      { $group: { _id: '$translationType', count: { $sum: 1 } } },
    ]);
    const voiceCount = typeCounts.find((t) => t._id === 'voice')?.count || 0;
    const textCount = typeCounts.find((t) => t._id === 'text')?.count || (totalTranslations - voiceCount);

    // Most used source language
    const topSourceAgg = await Translation.aggregate([
      { $match: { userId } },
      { $group: { _id: '$inputLanguage', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    const topSourceLang = topSourceAgg[0]?._id || null;

    // Most used target language
    const topTargetAgg = await Translation.aggregate([
      { $match: { userId } },
      { $group: { _id: '$outputLanguage', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    const topTargetLang = topTargetAgg[0]?._id || null;

    // Most translated language pair
    const topPairAgg = await Translation.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { source: '$inputLanguage', target: '$outputLanguage' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    const topLangPair = topPairAgg[0]
      ? { source: topPairAgg[0]._id.source, target: topPairAgg[0]._id.target, count: topPairAgg[0].count }
      : null;

    // Daily counts (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyCounts = await Translation.aggregate([
      { $match: { userId, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Weekly counts (last 4 weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 27);
    fourWeeksAgo.setHours(0, 0, 0, 0);

    const weeklyCounts = await Translation.aggregate([
      { $match: { userId, createdAt: { $gte: fourWeeksAgo } } },
      {
        $group: {
          _id: { $isoWeek: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Monthly counts (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyCounts = await Translation.aggregate([
      { $match: { userId, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Recent activity (last 20)
    const recentActivity = await Translation.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('inputLanguage outputLanguage originalText translatedText translationType createdAt');

    // Top pairs for charts
    const langPairs = topPairAgg.map((p) => ({
      source: p._id.source,
      target: p._id.target,
      count: p.count,
    }));

    return res.json({
      totalTranslations,
      voiceCount,
      textCount,
      topSourceLang,
      topTargetLang,
      topLangPair,
      langPairs,
      dailyCounts: dailyCounts.map((d) => ({ date: d._id, count: d.count })),
      weeklyCounts: weeklyCounts.map((w) => ({ week: w._id, count: w.count })),
      monthlyCounts: monthlyCounts.map((m) => ({ month: m._id, count: m.count })),
      recentActivity,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    return res.status(500).json({ error: 'Failed to load analytics' });
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

    const myMemorySrc = source_lang === 'auto' ? 'Autodetect' : source_lang;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${myMemorySrc}|${target_lang}`;
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
