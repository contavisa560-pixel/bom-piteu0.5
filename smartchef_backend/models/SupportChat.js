const mongoose = require('mongoose');

const SupportChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'closed','resolved'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

SupportChatSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('SupportChat', SupportChatSchema);