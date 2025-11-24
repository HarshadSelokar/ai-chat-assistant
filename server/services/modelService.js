const axios = require('axios');

/**
 * Generate response using different model providers
 */
async function generateResponse(userMessage, context = '', modelConfig = {}) {
  const { provider = 'ollama', model = 'llama2', apiKey, apiUrl } = modelConfig;

  try {
    let prompt = userMessage;
    if (context) {
      prompt = `${context}\n\nCurrent user message: ${userMessage}\n\nPlease provide a helpful response based on the context above and the current message.`;
    }

    switch (provider) {
      case 'ollama':
        return await generateWithOllama(prompt, model);
      
      case 'openai':
        return await generateWithOpenAI(prompt, model, apiKey);
      
      case 'anthropic':
        return await generateWithAnthropic(prompt, model, apiKey);
      
      case 'google':
        return await generateWithGoogle(prompt, model, apiKey);
      
      case 'custom':
        return await generateWithCustom(prompt, model, apiKey, apiUrl);
      
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error calling ${provider} API:`, error.message);
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error(`Cannot connect to ${provider}. Please check your configuration.`);
    }
    
    throw new Error(`Failed to generate response: ${error.message}`);
  }
}

/**
 * Generate with Ollama (local)
 */
async function generateWithOllama(prompt, model) {
  const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';
  
  const response = await axios.post(OLLAMA_API_URL, {
    model: model,
    prompt: prompt,
    stream: false
  }, {
    timeout: 60000
  });

  return response.data.response || 'Sorry, I could not generate a response.';
}

/**
 * Generate with OpenAI
 */
async function generateWithOpenAI(prompt, model, apiKey) {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    }
  );

  return response.data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
}

/**
 * Generate with Anthropic (Claude)
 */
async function generateWithAnthropic(prompt, model, apiKey) {
  if (!apiKey) {
    throw new Error('Anthropic API key is required');
  }

  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: model,
      max_tokens: 1024,
      messages: [
        { role: 'user', content: prompt }
      ],
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    }
  );

  return response.data.content[0]?.text || 'Sorry, I could not generate a response.';
}

/**
 * Generate with Google (Gemini)
 */
async function generateWithGoogle(prompt, model, apiKey) {
  if (!apiKey) {
    throw new Error('Google API key is required');
  }

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    }
  );

  return response.data.candidates[0]?.content?.parts[0]?.text || 'Sorry, I could not generate a response.';
}

/**
 * Generate with Custom API
 */
async function generateWithCustom(prompt, model, apiKey, apiUrl) {
  if (!apiUrl) {
    throw new Error('Custom API URL is required');
  }

  const headers = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  // Try OpenAI-compatible format first
  try {
    const response = await axios.post(
      apiUrl,
      {
        model: model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
      },
      {
        headers: headers,
        timeout: 60000,
      }
    );

    // Handle OpenAI-compatible response
    if (response.data.choices && response.data.choices[0]?.message?.content) {
      return response.data.choices[0].message.content;
    }

    // Handle Anthropic-compatible response
    if (response.data.content && Array.isArray(response.data.content)) {
      return response.data.content[0]?.text || '';
    }

    // Handle generic response
    if (response.data.response) {
      return response.data.response;
    }

    if (typeof response.data === 'string') {
      return response.data;
    }

    throw new Error('Unexpected response format from custom API');
  } catch (error) {
    if (error.response) {
      throw new Error(`Custom API error: ${error.response.data?.error?.message || error.message}`);
    }
    throw error;
  }
}

module.exports = {
  generateResponse
};

