const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const modelService = require('../services/modelService');
const ragService = require('../services/ragService');

/**
 * POST /api/chat/message
 * Send a message and get a response
 */
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId = 'default', modelConfig } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Save user message
    const userMessage = new Message({
      role: 'user',
      content: message.trim(),
      sessionId: sessionId
    });
    await userMessage.save();

    // Retrieve relevant context using RAG
    const relevantContext = await ragService.retrieveRelevantContext(
      message.trim(),
      sessionId,
      5 // Get top 5 relevant conversations
    );

    // Build context string
    const contextString = ragService.buildContextString(relevantContext);

    // Generate response using configured model with context
    const botResponse = await modelService.generateResponse(
      message.trim(), 
      contextString,
      modelConfig || { provider: 'ollama', model: 'llama2' }
    );

    // Save assistant response
    const assistantMessage = new Message({
      role: 'assistant',
      content: botResponse,
      sessionId: sessionId
    });
    await assistantMessage.save();

    // Return response
    res.json({
      response: botResponse,
      sessionId: sessionId,
      timestamp: assistantMessage.timestamp
    });
  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      message: error.message 
    });
  }
});

/**
 * GET /api/chat/history
 * Get chat history for a session
 */
router.get('/history', async (req, res) => {
  try {
    const { sessionId = 'default', limit = 50 } = req.query;

    const messages = await Message.find({ sessionId: sessionId })
      .sort({ timestamp: 1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      messages: messages,
      sessionId: sessionId
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch chat history',
      message: error.message 
    });
  }
});

/**
 * DELETE /api/chat/history
 * Clear chat history for a session
 */
router.delete('/history', async (req, res) => {
  try {
    const { sessionId = 'default' } = req.body;

    await Message.deleteMany({ sessionId: sessionId });

    res.json({ 
      message: 'Chat history cleared successfully',
      sessionId: sessionId 
    });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ 
      error: 'Failed to clear chat history',
      message: error.message 
    });
  }
});

module.exports = router;

