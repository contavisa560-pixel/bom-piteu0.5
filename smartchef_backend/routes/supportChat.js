const express = require('express');
const router = express.Router();
const SupportChat = require('../models/SupportChat');
const SupportMessage = require('../models/SupportMessage');
const authenticate = require('../middleware/auth');

const TEAM_ROLES = ["admin", "superadmin", "moderator"];
function isTeamMember(req, res, next) {
  if (!req.user || !TEAM_ROLES.includes(req.user.role)) {
    return res.status(403).json({ error: "Acesso negado" });
  }
  next();
}

// Iniciar ou obter chat ativo
router.post('/chats', authenticate, async (req, res) => {
  try {
    const userId = req.user.id; // ou req.user._id, dependendo do seu middleware

    let chat = await SupportChat.findOne({ userId, status: 'active' });

    if (!chat) {
      chat = new SupportChat({ userId });
      await chat.save();
    }

    // Buscar últimas 50 mensagens
    const messages = await SupportMessage.find({ chatId: chat._id })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    res.json({
      chatId: chat._id,
      status: chat.status,
      messages: messages.reverse() // ordem crescente
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao iniciar chat' });
  }
});

// Obter mensagens de um chat específico
router.get('/chats/:chatId/messages', authenticate, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await SupportChat.findOne({ _id: chatId, userId });
    if (!chat) {
      return res.status(404).json({ error: 'Chat não encontrado' });
    }

    const messages = await SupportMessage.find({ chatId })
      .sort({ timestamp: 1 })
      .limit(100);

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

// Enviar mensagem via REST (fallback)
router.post('/chats/:chatId/messages', authenticate, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const chat = await SupportChat.findOne({ _id: chatId, userId, status: 'active' });
    if (!chat) {
      return res.status(404).json({ error: 'Chat não encontrado ou inativo' });
    }

    const message = new SupportMessage({
      chatId,
      sender: 'user',
      content
    });
    await message.save();

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

// Listar todos os chats ativos (apenas admin)
// GET /api/support/admin/chats
router.get('/admin/chats', authenticate, isTeamMember, async (req, res) => {
  try {

    const chats = await SupportChat.aggregate([
      // Remova ou comente o $match para incluir todos os status
      // { $match: { status: 'active' } }, 
      {
        $lookup: {
          from: 'supportmessages',
          localField: '_id',
          foreignField: 'chatId',
          as: 'msgs'
        }
      },
      {
        $addFields: {
          lastMessage: { $arrayElemAt: ['$msgs.content', -1] },
          lastMsgTime: { $arrayElemAt: ['$msgs.timestamp', -1] },
          unreadCount: {
            $size: {
              $filter: {
                input: '$msgs',
                as: 'msg',
                cond: { $and: [{ $eq: ['$$msg.sender', 'user'] }, { $eq: ['$$msg.read', false] }] }
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $addFields: {
          userId: { $arrayElemAt: ['$user', 0] }
        }
      },
      { $project: { msgs: 0, user: 0 } },
      { $sort: { updatedAt: -1 } }
    ]);

    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar chats' });
  }
});
// Obter mensagens de um chat específico (para admin)
router.get('/admin/chats/:chatId/messages', authenticate, isTeamMember, async (req, res) => {
  try {
   
    const { chatId } = req.params;
    const messages = await SupportMessage.find({ chatId })
      .sort({ timestamp: 1 })
      .limit(100);
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

// Marcar mensagem como lida (opcional)
router.patch('/admin/messages/:messageId/read', authenticate, isTeamMember, async (req, res) => {
  try {
   
    const message = await SupportMessage.findByIdAndUpdate(req.params.messageId, { read: true }, { new: true });
    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao marcar mensagem como lida' });
  }
});

// Marcar chat como resolvido (apenas admin)
router.post('/admin/chats/:chatId/resolve', authenticate, isTeamMember, async (req, res) => {
  try {
   
    const { chatId } = req.params;
    const chat = await SupportChat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat não encontrado' });
    }
    chat.status = 'resolved';
    await chat.save();
    res.json({ success: true, message: 'Chat marcado como resolvido' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao marcar chat como resolvido' });
  }
});
// PATCH /api/support/admin/chats/:chatId/read-all
router.patch('/admin/chats/:chatId/read-all', authenticate, isTeamMember, async (req, res) => {
  try {
   
    const { chatId } = req.params;
    await SupportMessage.updateMany(
      { chatId, sender: 'user', read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao marcar como lidas' });
  }
});

// GET /api/support/admin/unread-count
router.get('/admin/unread-count', authenticate, isTeamMember, async (req, res) => {
  try {
    
    const count = await SupportChat.aggregate([
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'supportmessages',
          localField: '_id',
          foreignField: 'chatId',
          as: 'msgs'
        }
      },
      {
        $addFields: {
          unreadCount: {
            $size: {
              $filter: {
                input: '$msgs',
                as: 'msg',
                cond: { $and: [{ $eq: ['$$msg.sender', 'user'] }, { $eq: ['$$msg.read', false] }] }
              }
            }
          }
        }
      },
      { $match: { unreadCount: { $gt: 0 } } },
      { $count: 'total' }
    ]);
    res.json({ total: count[0]?.total || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter contagem' });
  }
});

module.exports = router;