import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { db } from '../db.js';
import { parseListingText, matchAndRankListings, askHumoDispatcher, checkDispatcherRateLimit, translateChatMessage } from '../services/aiService.js';
import { processListingPhones } from './subscriptionRoutes.js';

export const aiRouter = Router();

// POST /api/ai/parse-listing
// Strictly parses raw text into structured listing parameters
aiRouter.post('/parse-listing', requireAuth, async (req, res) => {
  try {
    const { text, type = 'cargo' } = req.body || {};

    if (!text || typeof text !== 'string' || text.trim().length < 5) {
      return res.status(400).json({
        error: 'empty_text',
        message: 'Matn bo‘sh yoki juda qisqa (kamida 5 ta belgi bo‘lishi kerak)'
      });
    }

    if (text.length > 1000) {
      return res.status(400).json({
        error: 'text_too_long',
        message: 'Matn uzunligi 1000 belgidan oshmasligi kerak'
      });
    }

    const listingType = type === 'transport' ? 'transport' : 'cargo';
    const result = await parseListingText(text, listingType, req.user.id);

    if (result.error === 'rate_limit_exceeded') {
      return res.status(429).json({
        error: 'rate_limit_exceeded',
        message: 'AI so‘rovlar limiti tugadi (soatiga 20 ta). Iltimos, keyinroq urinib ko‘ring.',
        retryAfter: result.retryAfter
      });
    }

    if (result.valid === false || result.error === 'not_logistics') {
      return res.status(400).json({
        error: 'not_logistics',
        message: 'Faqat yuk yoki transport e‘loni matnini kiriting.'
      });
    }

    return res.json({
      success: true,
      type: listingType,
      data: result
    });
  } catch (err) {
    console.error('Error in /api/ai/parse-listing:', err);
    return res.status(500).json({
      error: 'ai_error',
      message: 'AI tahlilida xatolik yuz berdi'
    });
  }
});

// POST /api/ai/match
// Smart matching: finds and AI-ranks the best matching trucks for a cargo (or cargos for a truck)
aiRouter.post('/match', requireAuth, async (req, res) => {
  try {
    const { listing_type = 'cargo', listing_id, lang = 'uz' } = req.body || {};

    if (!listing_id) {
      return res.status(400).json({
        error: 'missing_id',
        message: 'listing_id ko‘rsatilishi shart'
      });
    }

    if (!['cargo', 'transport'].includes(listing_type)) {
      return res.status(400).json({
        error: 'invalid_type',
        message: 'listing_type cargo yoki transport bo‘lishi shart'
      });
    }

    const cleanLang = ['uz', 'ru', 'en'].includes(lang) ? lang : 'uz';

    if (listing_type === 'cargo') {
      // 1. Fetch Target Cargo
      const target = await db.queryOne(`
        SELECT l.*, u.first_name, u.last_name, u.phone as owner_phone, u.is_verified as owner_verified, u.role as owner_role
        FROM listings l
        JOIN users u ON l.user_id = u.id
        WHERE l.id = $1 AND l.status = 'active'
      `, [listing_id]);

      if (!target) {
        return res.status(404).json({
          error: 'cargo_not_found',
          message: 'Faol yuk e‘loni topilmadi'
        });
      }

      // 2. Query Candidate Active Transports (exclude target owner if possible, or all active trucks)
      let candidates = await db.queryAll(`
        SELECT t.*, u.first_name, u.last_name, u.phone as owner_phone, u.is_verified as owner_verified, u.role as owner_role
        FROM transports t
        JOIN users u ON t.user_id = u.id
        WHERE t.status = 'active' AND t.user_id != $1
        ORDER BY t.created_at DESC
        LIMIT 25
      `, [target.user_id]);

      // If user is testing with only their own trucks or very small database, fallback to all active trucks
      if (!candidates || candidates.length === 0) {
        candidates = await db.queryAll(`
          SELECT t.*, u.first_name, u.last_name, u.phone as owner_phone, u.is_verified as owner_verified, u.role as owner_role
          FROM transports t
          JOIN users u ON t.user_id = u.id
          WHERE t.status = 'active'
          ORDER BY t.created_at DESC
          LIMIT 25
        `);
      }

      const rankedMatches = await matchAndRankListings(target, candidates, 'cargo', cleanLang);

      // Process phones through subscription / monetization rules
      const processedMatches = await processListingPhones(rankedMatches, req.user, 'transport');

      return res.json({
        success: true,
        target_type: 'cargo',
        target_id: listing_id,
        target,
        matches: processedMatches
      });
    } else {
      // 1. Fetch Target Transport
      const target = await db.queryOne(`
        SELECT t.*, u.first_name, u.last_name, u.phone as owner_phone, u.is_verified as owner_verified, u.role as owner_role
        FROM transports t
        JOIN users u ON t.user_id = u.id
        WHERE t.id = $1 AND t.status = 'active'
      `, [listing_id]);

      if (!target) {
        return res.status(404).json({
          error: 'transport_not_found',
          message: 'Faol transport e‘loni topilmadi'
        });
      }

      // 2. Query Candidate Active Cargo Listings
      let candidates = await db.queryAll(`
        SELECT l.*, u.first_name, u.last_name, u.phone as owner_phone, u.is_verified as owner_verified, u.role as owner_role
        FROM listings l
        JOIN users u ON l.user_id = u.id
        WHERE l.status = 'active' AND l.user_id != $1
        ORDER BY l.created_at DESC
        LIMIT 25
      `, [target.user_id]);

      if (!candidates || candidates.length === 0) {
        candidates = await db.queryAll(`
          SELECT l.*, u.first_name, u.last_name, u.phone as owner_phone, u.is_verified as owner_verified, u.role as owner_role
          FROM listings l
          JOIN users u ON l.user_id = u.id
          WHERE l.status = 'active'
          ORDER BY l.created_at DESC
          LIMIT 25
        `);
      }

      const rankedMatches = await matchAndRankListings(target, candidates, 'transport', cleanLang);

      // Process phones through subscription / monetization rules
      const processedMatches = await processListingPhones(rankedMatches, req.user, 'cargo');

      return res.json({
        success: true,
        target_type: 'transport',
        target_id: listing_id,
        target,
        matches: processedMatches
      });
    }
  } catch (err) {
    console.error('Error in /api/ai/match:', err);
    return res.status(500).json({
      error: 'match_error',
      message: 'AI moslash tizimida xatolik yuz berdi'
    });
  }
});

// POST /api/ai/ask
// Humo AI Dispatcher Assistant (supports both logged-in users and guests)
aiRouter.post('/ask', async (req, res) => {
  try {
    const { question, lang = 'uz', context = [] } = req.body || {};

    if (!question || typeof question !== 'string' || question.trim().length < 2) {
      return res.status(400).json({
        error: 'empty_question',
        message: 'Savol matni kiritilmadi'
      });
    }

    if (question.length > 1000) {
      return res.status(400).json({
        error: 'question_too_long',
        message: 'Savol uzunligi 1000 belgidan oshmasligi kerak'
      });
    }

    // Determine user identifier for rate limiting (fallback to IP for guests)
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'guest';
    const userId = req.user ? req.user.id : `guest_${clientIp.replace(/[^a-zA-Z0-9]/g, '_')}`;

    // Rate limit: max 25 questions per hour per user/IP
    const rateCheck = checkDispatcherRateLimit(userId);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: 'rate_limit_exceeded',
        message: 'AI Dispetcher so‘rovlar limiti tugadi (soatiga 25 ta). Iltimos, birozdan so‘ng urinib ko‘ring.',
        retryAfter: rateCheck.retryAfterSeconds
      });
    }

    const cleanLang = ['uz', 'ru', 'en'].includes(lang) ? lang : 'uz';
    const result = await askHumoDispatcher(question, cleanLang, userId, context);

    return res.json({
      success: true,
      answer: result.answer,
      refused: result.refused || false
    });
  } catch (err) {
    console.error('Error in /api/ai/ask:', err);
    return res.status(500).json({
      error: 'dispatcher_error',
      message: 'AI Dispetcher xizmatida xatolik yuz berdi'
    });
  }
});

// POST /api/ai/translate
// In-Chat One-Click Logistics Message Translator
aiRouter.post('/translate', requireAuth, async (req, res) => {
  try {
    const { text, target_lang = 'uz' } = req.body || {};

    if (!text || typeof text !== 'string' || text.trim().length < 1) {
      return res.status(400).json({
        error: 'empty_text',
        message: 'Tarjima uchun matn kiritilmadi'
      });
    }

    if (text.length > 1000) {
      return res.status(400).json({
        error: 'text_too_long',
        message: 'Matn uzunligi 1000 belgidan oshmasligi kerak'
      });
    }

    const cleanTarget = ['uz', 'ru', 'en'].includes(target_lang) ? target_lang : 'uz';
    const result = await translateChatMessage(text, cleanTarget, req.user.id);

    return res.json({
      success: true,
      translated_text: result.translated_text,
      target_lang: result.target_lang
    });
  } catch (err) {
    console.error('Error in /api/ai/translate:', err);
    return res.status(500).json({
      error: 'translation_error',
      message: 'Tarjima xizmatida xatolik yuz berdi'
    });
  }
});
