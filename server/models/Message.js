const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant']
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  sessionId: {
    type: String,
    default: 'default'
  }
});

// Index for efficient querying
messageSchema.index({ sessionId: 1, timestamp: 1 });
messageSchema.index({ content: 'text' }); // Text index for search

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;

