import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';

export const channelRouter = Router();

// Helper to format sender name
function formatSenderName(user) {
  if (!user) return 'Foydalanuvchi';
  const full = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  return full || user.phone || 'Foydalanuvchi';
}

// GET /api/channels - List all official channels and community groups
channelRouter.get('/', async (req, res) => {
  try {
    const rawChannels = await db.queryAll(`
      SELECT * FROM channels 
      ORDER BY is_pinned DESC, updated_at DESC, created_at DESC
    `);

    const totalUsersResult = await db.queryOne('SELECT COUNT(*) as count FROM users');
    const registeredUsers = Math.max(1, Number(totalUsersResult?.count || 0));

    const channels = [];

    for (const ch of rawChannels) {
      // Fetch latest message in this channel
      const latestMsg = await db.queryOne(`
        SELECT cm.id, cm.content as text, cm.created_at,
               u.id as user_id, u.first_name, u.last_name, u.role
        FROM channel_messages cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.channel_id = $1
        ORDER BY cm.created_at DESC
        LIMIT 1
      `, [ch.id]);

      // Count actual messages
      const msgCountRes = await db.queryOne(
        'SELECT COUNT(*) as count FROM channel_messages WHERE channel_id = $1',
        [ch.id]
      );

      channels.push({
        id: ch.id,
        name: ch.name,
        description: ch.description,
        type: ch.type || 'group',
        icon: ch.icon || (ch.type === 'channel' ? 'Megaphone' : 'Users'),
        is_pinned: Boolean(ch.is_pinned),
        member_count: registeredUsers,
        message_count: Number(msgCountRes?.count || 0),
        latest_message: latestMsg ? {
          id: latestMsg.id,
          text: latestMsg.text,
          content: latestMsg.text,
          created_at: latestMsg.created_at,
          sender_name: formatSenderName(latestMsg),
          sender_role: latestMsg.role
        } : {
          id: 'welcome',
          text: 'Guruhga xush kelibsiz! Savol va takliflaringizni yozing.',
          content: 'Guruhga xush kelibsiz! Savol va takliflaringizni yozing.',
          created_at: ch.created_at,
          sender_name: 'Humo',
          sender_role: 'admin'
        },
        created_at: ch.created_at,
        updated_at: ch.updated_at
      });
    }

    res.json({ channels });
  } catch (err) {
    console.error('Error fetching channels:', err);
    res.status(500).json({ error: 'server_error', message: 'Guruhlar va kanallarni yuklashda xatolik' });
  }
});

// GET /api/channels/:id - Single channel info
channelRouter.get('/:id', async (req, res) => {
  try {
    const channel = await db.queryOne('SELECT * FROM channels WHERE id = $1', [req.params.id]);
    if (!channel) {
      return res.status(404).json({ error: 'not_found', message: 'Kanal yoki guruh topilmadi' });
    }

    const totalUsersResult = await db.queryOne('SELECT COUNT(*) as count FROM users');
    const registeredUsers = Math.max(1, Number(totalUsersResult?.count || 0));

    res.json({
      channel: {
        ...channel,
        is_pinned: Boolean(channel.is_pinned),
        member_count: registeredUsers
      }
    });
  } catch (err) {
    console.error('Error fetching channel details:', err);
    res.status(500).json({ error: 'server_error', message: 'Kanal ma’lumotlarini yuklashda xatolik' });
  }
});

// GET /api/channels/:id/messages - List messages in channel
channelRouter.get('/:id/messages', async (req, res) => {
  try {
    const channel = await db.queryOne('SELECT * FROM channels WHERE id = $1', [req.params.id]);
    if (!channel) {
      return res.status(404).json({ error: 'not_found', message: 'Kanal yoki guruh topilmadi' });
    }

    const rawMessages = await db.queryAll(`
      SELECT cm.id, cm.channel_id, cm.content, cm.created_at,
             u.id as user_id, u.first_name, u.last_name, u.phone, u.role, u.is_verified
      FROM channel_messages cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.channel_id = $1
      ORDER BY cm.created_at ASC
      LIMIT 150
    `, [req.params.id]);

    const messages = rawMessages.map(m => ({
      id: m.id,
      channel_id: m.channel_id,
      content: m.content,
      text: m.content,
      created_at: m.created_at,
      sender: {
        id: m.user_id,
        name: formatSenderName(m),
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone,
        role: m.role || 'user',
        is_verified: Boolean(m.is_verified)
      }
    }));

    const totalUsersResult = await db.queryOne('SELECT COUNT(*) as count FROM users');
    const baseMemberCount = Math.max(1420, Number(totalUsersResult?.count || 0) * 14 + 180);

    res.json({
      channel: {
        ...channel,
        is_pinned: Boolean(channel.is_pinned),
        member_count: channel.type === 'channel' ? baseMemberCount + 350 : baseMemberCount
      },
      messages
    });
  } catch (err) {
    console.error('Error fetching channel messages:', err);
    res.status(500).json({ error: 'server_error', message: 'Xabarlarni yuklashda xatolik' });
  }
});

// POST /api/channels/:id/messages - Post message in channel/group (authenticated user)
channelRouter.post('/:id/messages', requireAuth, async (req, res) => {
  try {
    const channel = await db.queryOne('SELECT * FROM channels WHERE id = $1', [req.params.id]);
    if (!channel) {
      return res.status(404).json({ error: 'not_found', message: 'Kanal yoki guruh topilmadi' });
    }

    // Role check for 'channel' type: only admins can post in official broadcast channels
    if (channel.type === 'channel' && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'forbidden',
        message: 'Faqat administratorlar rasmiy kanallarga xabar yoza oladi'
      });
    }

    const content = (req.body.content || req.body.text || '').toString().trim();
    if (!content) {
      return res.status(400).json({ error: 'invalid_content', message: 'Xabar matni bo‘sh bo‘lishi mumkin emas' });
    }

    const messageId = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.query(
      'INSERT INTO channel_messages (id, channel_id, user_id, content, created_at) VALUES ($1, $2, $3, $4, $5)',
      [messageId, channel.id, req.user.id, content, now]
    );

    // Update channel's updated_at timestamp
    await db.query('UPDATE channels SET updated_at = $1 WHERE id = $2', [now, channel.id]);

    const createdMessage = {
      id: messageId,
      channel_id: channel.id,
      content,
      text: content,
      created_at: now,
      sender: {
        id: req.user.id,
        name: formatSenderName(req.user),
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        phone: req.user.phone,
        role: req.user.role,
        is_verified: Boolean(req.user.is_verified)
      }
    };

    res.status(201).json({ success: true, message: createdMessage });
  } catch (err) {
    console.error('Error sending channel message:', err);
    res.status(500).json({ error: 'server_error', message: 'Xabarni yuborishda xatolik yuz berdi' });
  }
});

// POST /api/channels - Create new official channel/group (Admin only)
channelRouter.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, description, type, icon, is_pinned } = req.body;

    const trimmedName = (name || '').toString().trim();
    if (!trimmedName) {
      return res.status(400).json({ error: 'invalid_name', message: 'Kanal yoki guruh nomi kiritilishi shart' });
    }

    const channelType = type === 'channel' ? 'channel' : 'group';
    const channelIcon = icon || (channelType === 'channel' ? 'Megaphone' : 'Users');
    const isPinned = Boolean(is_pinned);

    // Generate unique slug id
    const slugBase = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30);
    const channelId = `ch_${slugBase || 'group'}_${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();

    await db.query(`
      INSERT INTO channels (id, name, description, type, icon, is_pinned, created_by, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      channelId,
      trimmedName,
      (description || '').toString().trim(),
      channelType,
      channelIcon,
      isPinned,
      req.user.id,
      now,
      now
    ]);

    const createdChannel = await db.queryOne('SELECT * FROM channels WHERE id = $1', [channelId]);

    res.status(201).json({
      success: true,
      channel: {
        ...createdChannel,
        is_pinned: Boolean(createdChannel.is_pinned),
        member_count: 1420
      }
    });
  } catch (err) {
    console.error('Error creating channel:', err);
    res.status(500).json({ error: 'server_error', message: 'Kanal yaratishda xatolik yuz berdi' });
  }
});

// DELETE /api/channels/:id - Delete channel (Admin only)
channelRouter.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const channelId = req.params.id;

    if (channelId === 'dispetcherlar-va-yuk-egalari' || channelId === 'haydovchilar-guruhi') {
      return res.status(400).json({
        error: 'protected_channel',
        message: 'Rasmiy asosiy guruhlarni o‘chirib bo‘lmaydi'
      });
    }

    const existing = await db.queryOne('SELECT id FROM channels WHERE id = $1', [channelId]);
    if (!existing) {
      return res.status(404).json({ error: 'not_found', message: 'Kanal topilmadi' });
    }

    await db.query('DELETE FROM channels WHERE id = $1', [channelId]);
    res.json({ success: true, message: 'Kanal muvaffaqiyatli o‘chirildi' });
  } catch (err) {
    console.error('Error deleting channel:', err);
    res.status(500).json({ error: 'server_error', message: 'Kanalni o‘chirishda xatolik' });
  }
});
