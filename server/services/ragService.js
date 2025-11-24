const Message = require('../models/Message');

/**
 * Retrieve relevant past conversations based on the current user query
 * Uses text search and similarity matching to find contextually relevant messages
 */
async function retrieveRelevantContext(userQuery, sessionId = 'default', limit = 5) {
  try {
    // First, try to find messages with similar content using text search
    const textSearchResults = await Message.find(
      {
        $text: { $search: userQuery },
        sessionId: sessionId,
        role: 'user'
      },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .lean();

    // If text search doesn't return enough results, get recent messages
    let results = textSearchResults;
    if (results.length < limit) {
      const recentMessages = await Message.find({
        sessionId: sessionId,
        role: 'user'
      })
      .sort({ timestamp: -1 })
      .limit(limit - results.length)
      .lean();

      // Combine and deduplicate
      const existingIds = new Set(results.map(r => r._id.toString()));
      results = [
        ...results,
        ...recentMessages.filter(m => !existingIds.has(m._id.toString()))
      ];
    }

    // For each relevant user message, get the corresponding assistant response
    const contextPairs = [];
    for (const userMsg of results) {
      const assistantResponse = await Message.findOne({
        sessionId: sessionId,
        role: 'assistant',
        timestamp: { $gte: userMsg.timestamp }
      })
      .sort({ timestamp: 1 })
      .limit(1)
      .lean();

      if (assistantResponse) {
        contextPairs.push({
          user: userMsg.content,
          assistant: assistantResponse.content
        });
      }
    }

    return contextPairs;
  } catch (error) {
    console.error('Error retrieving relevant context:', error);
    // Fallback: return empty array if there's an error
    return [];
  }
}

/**
 * Build context string from retrieved conversations
 */
function buildContextString(contextPairs) {
  if (contextPairs.length === 0) {
    return '';
  }

  let context = 'Previous conversation context:\n';
  contextPairs.forEach((pair, index) => {
    context += `\n[Context ${index + 1}]\n`;
    context += `User: ${pair.user}\n`;
    context += `Assistant: ${pair.assistant}\n`;
  });

  return context;
}

module.exports = {
  retrieveRelevantContext,
  buildContextString
};

