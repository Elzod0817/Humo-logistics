import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';

export const chatRouter = Router();

// Middleware: Authenticated user required for all chat routes
chatRouter.use((req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'unauthorized', message: 'Authentication required' });
  }
  next();
});

// GET /api/chat/unread-count - Total unread incoming messages count for current user
chatRouter.get('/unread-count', async (req, res) => {
  try {
    const result = await db.queryOne(`
      SELECT COUNT(*) as count
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE (c.sender_id = $1 OR c.receiver_id = $2)
        AND m.sender_id != $3
        AND m.is_read = $4
    `, [req.user.id, req.user.id, req.user.id, false]);

    res.json({ unread_count: Number(result?.count || 0) });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch unread count' });
  }
});

// GET /api/chat/conversations - All conversations for current user
chatRouter.get('/conversations', async (req, res) => {
  try {
    const rawConversations = await db.queryAll(`
      SELECT c.*
      FROM conversations c
      WHERE c.sender_id = $1 OR c.receiver_id = $2
      ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
    `, [req.user.id, req.user.id]);

    const conversations = [];

    for (const conv of rawConversations) {
      const otherUserId = conv.sender_id === req.user.id ? conv.receiver_id : conv.sender_id;
      const otherUser = await db.queryOne(
        `SELECT id, first_name, last_name, phone, role, is_verified FROM users WHERE id = $1`,
        [otherUserId]
      );

      let listing = null;
      if (conv.listing_type === 'cargo') {
        listing = await db.queryOne(`
          SELECT id, origin_country, origin_locality, origin_custom, destination_country, 
                 destination_locality, destination_custom, cargo_name, weight, volume, body_type, 
                 price_type, price_amount, price_currency, status 
          FROM listings WHERE id = $1
        `, [conv.listing_id]);
      } else if (conv.listing_type === 'transport') {
        listing = await db.queryOne(`
          SELECT id, origin_country, origin_city, destination_country, destination_city, 
                 truck_model, max_weight, volume, body_type, price_expectation, phone, status 
          FROM transports WHERE id = $1
        `, [conv.listing_id]);
      }

      const unreadResult = await db.queryOne(`
        SELECT COUNT(*) as count 
        FROM messages 
        WHERE conversation_id = $1 AND sender_id != $2 AND is_read = $3
      `, [conv.id, req.user.id, false]);

      conversations.push({
        ...conv,
        other_user: otherUser,
        listing,
        unread_count: Number(unreadResult?.count || 0)
      });
    }

    res.json({ conversations });
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch conversations' });
  }
});

// POST /api/chat/conversations - Start or retrieve an existing conversation
chatRouter.post('/conversations', async (req, res) => {
  try {
    const { listing_type, listing_id, receiver_id, message, offered_price } = req.body;

    if (!listing_type || !listing_id) {
      return res.status(400).json({ error: 'invalid_data', message: 'listing_type and listing_id are required' });
    }

    if (!['cargo', 'transport'].includes(listing_type)) {
      return res.status(400).json({ error: 'invalid_type', message: 'listing_type must be cargo or transport' });
    }

    // Retrieve listing to identify owner if receiver_id not provided
    let targetOwnerId = receiver_id;
    if (listing_type === 'cargo') {
      const cargo = await db.queryOne(`SELECT * FROM listings WHERE id = $1`, [listing_id]);
      if (!cargo) return res.status(404).json({ error: 'listing_not_found', message: 'Cargo listing not found' });
      if (!targetOwnerId) targetOwnerId = cargo.user_id;
    } else {
      const transport = await db.queryOne(`SELECT * FROM transports WHERE id = $1`, [listing_id]);
      if (!transport) return res.status(404).json({ error: 'listing_not_found', message: 'Transport listing not found' });
      if (!targetOwnerId) targetOwnerId = transport.user_id;
    }

    // Prevent chatting with oneself
    if (req.user.id === targetOwnerId) {
      return res.status(400).json({ 
        error: 'cannot_chat_with_self', 
        message: 'You cannot start a conversation with yourself' 
      });
    }

    // Check if conversation already exists between these users for this listing
    const existing = await db.queryOne(`
      SELECT * FROM conversations 
      WHERE listing_type = $1 AND listing_id = $2 
        AND ((sender_id = $3 AND receiver_id = $4) OR (sender_id = $5 AND receiver_id = $6))
      LIMIT 1
    `, [listing_type, listing_id, req.user.id, targetOwnerId, targetOwnerId, req.user.id]);

    const now = new Date().toISOString();

    if (existing) {
      // If a message was sent, add it to this existing conversation
      if (message || offered_price) {
        const msgId = crypto.randomUUID();
        const content = message ? message.trim() : `Taklif qilingan narx: ${Number(offered_price).toLocaleString()} UZS`;
        await db.query(`
          INSERT INTO messages (id, conversation_id, sender_id, content, offered_price, is_read, created_at)
          VALUES ($1, $2, $3, $4, $5, false, $6)
        `, [msgId, existing.id, req.user.id, content, offered_price ? Number(offered_price) : null, now]);

        await db.query(`
          UPDATE conversations SET last_message = $1, last_message_at = $2 WHERE id = $3
        `, [content, now, existing.id]);

        existing.last_message = content;
        existing.last_message_at = now;
      }
      return res.json({ conversation: existing, created: false });
    }

    // Create new conversation
    const convId = crypto.randomUUID();
    const initialContent = message ? message.trim() : (offered_price ? `Taklif qilingan narx: ${Number(offered_price).toLocaleString()} UZS` : null);

    await db.query(`
      INSERT INTO conversations (id, listing_type, listing_id, sender_id, receiver_id, last_message, last_message_at, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      convId,
      listing_type,
      listing_id,
      req.user.id,
      targetOwnerId,
      initialContent,
      initialContent ? now : null,
      now
    ]);

    if (initialContent) {
      const msgId = crypto.randomUUID();
      await db.query(`
        INSERT INTO messages (id, conversation_id, sender_id, content, offered_price, is_read, created_at)
        VALUES ($1, $2, $3, $4, $5, false, $6)
      `, [msgId, convId, req.user.id, initialContent, offered_price ? Number(offered_price) : null, now]);
    }

    const createdConv = await db.queryOne(`SELECT * FROM conversations WHERE id = $1`, [convId]);
    res.status(201).json({ conversation: createdConv, created: true });
  } catch (err) {
    console.error('Error starting conversation:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to start conversation' });
  }
});

// GET /api/chat/conversations/:id/messages - Message history & marks unread messages as read
chatRouter.get('/conversations/:id/messages', async (req, res) => {
  try {
    const conv = await db.queryOne(`SELECT * FROM conversations WHERE id = $1`, [req.params.id]);
    if (!conv) {
      return res.status(404).json({ error: 'not_found', message: 'Conversation not found' });
    }

    // Authorization check
    if (conv.sender_id !== req.user.id && conv.receiver_id !== req.user.id) {
      return res.status(403).json({ error: 'forbidden', message: 'Access denied' });
    }

    // Mark incoming unread messages as read
    await db.query(`
      UPDATE messages SET is_read = $3 
      WHERE conversation_id = $1 AND sender_id != $2 AND is_read = $4
    `, [conv.id, req.user.id, true, false]);

    // Fetch messages
    const messages = await db.queryAll(`
      SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC
    `, [conv.id]);

    // Fetch other user info
    const otherUserId = conv.sender_id === req.user.id ? conv.receiver_id : conv.sender_id;
    const otherUser = await db.queryOne(`
      SELECT id, first_name, last_name, phone, role, is_verified FROM users WHERE id = $1
    `, [otherUserId]);

    // Fetch listing info
    let listing = null;
    if (conv.listing_type === 'cargo') {
      listing = await db.queryOne(`SELECT * FROM listings WHERE id = $1`, [conv.listing_id]);
    } else {
      listing = await db.queryOne(`SELECT * FROM transports WHERE id = $1`, [conv.listing_id]);
    }

    res.json({
      conversation: conv,
      other_user: otherUser,
      listing,
      messages
    });
  } catch (err) {
    console.error('Error fetching conversation messages:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to fetch messages' });
  }
});

// POST /api/chat/conversations/:id/messages - Send a message in conversation
chatRouter.post('/conversations/:id/messages', async (req, res) => {
  try {
    const conv = await db.queryOne(`SELECT * FROM conversations WHERE id = $1`, [req.params.id]);
    if (!conv) {
      return res.status(404).json({ error: 'not_found', message: 'Conversation not found' });
    }

    // Authorization check
    if (conv.sender_id !== req.user.id && conv.receiver_id !== req.user.id) {
      return res.status(403).json({ error: 'forbidden', message: 'Access denied' });
    }

    const { content, offered_price } = req.body;
    let text = content ? content.trim() : '';

    if (!text && offered_price) {
      text = `Taklif qilingan narx: ${Number(offered_price).toLocaleString()} UZS`;
    }

    if (!text) {
      return res.status(400).json({ error: 'content_required', message: 'Message content or price offer is required' });
    }

    const msgId = crypto.randomUUID();
    const now = new Date().toISOString();
    const price = offered_price ? Number(offered_price) : null;

    await db.query(`
      INSERT INTO messages (id, conversation_id, sender_id, content, offered_price, is_read, created_at)
      VALUES ($1, $2, $3, $4, $5, false, $6)
    `, [msgId, conv.id, req.user.id, text, price, now]);

    await db.query(`
      UPDATE conversations SET last_message = $1, last_message_at = $2 WHERE id = $3
    `, [text, now, conv.id]);

    const message = await db.queryOne(`SELECT * FROM messages WHERE id = $1`, [msgId]);
    res.status(201).json({ message });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'server_error', message: 'Failed to send message' });
  }
});
