const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true }, // Ex.: "chat_text", "generate_image", "vision_read"
  route: { type: String, required: true },
  tokensUsed: { type: Number, default: 0 },
  error: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
