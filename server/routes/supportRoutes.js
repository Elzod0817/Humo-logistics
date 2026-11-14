import { Router } from 'express';
import { db } from '../db.js';

export const supportRouter = Router();

// GET /api/support - Public endpoint for support settings and active social links
supportRouter.get('/', async (req, res) => {
  try {
    let support = await db.queryOne('SELECT * FROM support_settings WHERE id = 1');
    if (!support) {
      support = {
        id: 1,
        phone: '+998 71 200 00 00',
        email: 'support@humologistics.uz',
        telegram_support: 'https://t.me/humo_support',
        whatsapp_support: 'https://wa.me/998901234567',
        working_hours_uz: 'Dushanba - Shanba: 09:00 - 20:00',
        working_hours_ru: 'Понедельник - Суббота: 09:00 - 20:00',
        working_hours_en: 'Monday - Saturday: 09:00 - 20:00',
        address_uz: 'Toshkent sh., Amir Temur shox ko‘chasi, 107-B',
        address_ru: 'г. Ташкент, пр. Амира Темура, 107-Б',
        address_en: 'Tashkent, Amir Temur Ave, 107-B',
        is_widget_enabled: 1
      };
    }

    const socials = await db.queryAll(`
      SELECT * FROM social_links 
      WHERE is_active = true
      ORDER BY sort_order ASC, created_at ASC
    `);

    res.json({ support, socials });
  } catch (err) {
    console.error('Error fetching support & social links:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch support data' });
  }
});
