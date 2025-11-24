const axios = require('axios');

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama2';

/**
 * Generate response using Ollama API
 */
async function generateResponse(userMessage, context = '') {
  try {
    // Build the prompt with context
    let prompt = userMessage;
    if (context) {
      prompt = `${context}\n\nCurrent user message: ${userMessage}\n\nPlease provide a helpful response based on the context above and the current message.`;
    }

    const response = await axios.post(OLLAMA_API_URL, {
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false
    }, {
      timeout: 60000 // 60 second timeout
    });

    return response.data.response || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Error calling Ollama API:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to Ollama. Please make sure Ollama is running on ' + OLLAMA_API_URL);
    }
    
    throw new Error('Failed to generate response: ' + error.message);
  }
}

module.exports = {
  generateResponse
};

