const Message = require("../models/Message");

async function saveMessage({ userId, role, content, model }) {
  if (!role || !content) {
    throw new Error("Mensagem inválida: role e content são obrigatórios");
  }

  return await Message.create({
    userId,
    role,
    content,
    model
  });
}

module.exports = { saveMessage };
