const mongoose = require('mongoose');

const SupportMessageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupportChat',
    required: true,
    index: true
  },
  sender: {
    type: String,
    enum: ['user', 'support'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SupportMessage', SupportMessageSchema);