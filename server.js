const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Configure CORS as needed for production

// Serve static files from the public directory
app.use(express.static('public'));

// Constants
const PORT = process.env.PORT || 3001;

// Hardcoded system prompt (copied from frontend)
const HARDCODED_SYSTEM_PROMPT = `# System Instruction Prompt
You are an AI crafting SEO-optimized titles and meta descriptions for local business websites. Generate a title (50–60 characters) using "[Adjective] [Service] in [City, State]" format, avoiding brand names and state abbreviations. Create a meta description (140–155 characters) aligned with page content and user intent, incorporating the primary keyword naturally, using action-oriented verbs (e.g., "Discover," "Get"), and including a clear value proposition or call-to-action. Ensure uniqueness, readability, and relevance. Exclude business names. Output both in plain markdown with character counts as shown below.

# Output Format
**SEO Title**: [Title]  
**Character Count**: [Number]  
**Meta Description**: [Description]  
**Character Count**: [Number]  

# Example (Single Output)
**Input**: "We offer professional plumbing services in Bend, OR."  
**Output**:
**SEO Title**: Top Plumbing in Bend, Oregon  
**Character Count**: 56  
**Meta Description**: Need a plumber in Bend, Oregon? Get reliable, fast plumbing services today!  
**Character Count**: 142

# Follow-up
After providing the output, ask the user: "Would you like to see other variations of the SEO Title or Meta Description?"

# Guardrails
Only answer questions directly related to generating SEO titles and meta descriptions based on the provided input. Politely refuse any other type of request.`;

// API endpoint for chat
app.post('/api/chat', async (req, res) => {
  try {
    // Extract data from request
    const { messages, userApiKey } = req.body;

    // Validate input
    if (!messages || !Array.isArray(messages) || !userApiKey) {
      return res.status(400).json({ 
        error: 'Invalid request. Required fields: messages (array) and userApiKey (string).' 
      });
    }

    // Format messages for Gemini API
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Fixed model name (from frontend)
    const MODEL_NAME = 'gemini-2.0-flash';
    
    // Construct the Google Gemini API URL with the user's API key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${userApiKey}`;

    // Prepare request body for Google API
    const requestBody = {
      contents: formattedMessages,
      systemInstruction: {
        parts: [{ text: HARDCODED_SYSTEM_PROMPT }]
      }
    };

    // Make request to Google Gemini API
    const response = await axios.post(apiUrl, requestBody, {
      headers: { 'Content-Type': 'application/json' }
    });

    // Extract assistant response
    const assistantResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    // Handle empty/blocked response cases
    if (!assistantResponse) {
      const blockReason = response.data?.promptFeedback?.blockReason;
      const finishReason = response.data?.candidates?.[0]?.finishReason;
      
      let specificError = "Received an empty or unexpected response from the API.";
      
      if (blockReason) {
        specificError = `Response blocked due to: ${blockReason}.`;
      } else if (finishReason && finishReason !== 'STOP') {
        specificError = `Generation finished unexpectedly: ${finishReason}.`;
      } else if (response.data?.candidates?.length > 0 && !assistantResponse) {
        specificError = "Received response candidate, but text part is missing.";
      }
      
      return res.status(400).json({ error: specificError });
    }

    // Return successful response
    return res.json({ 
      message: assistantResponse 
    });

  } catch (error) {
    console.error('Proxy API Error:', error);
    
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const statusCode = error.response.status;
      const errorMessage = error.response.data?.error?.message || 'Unknown API error';
      
      return res.status(statusCode).json({
        error: `Google API Error: ${errorMessage}`
      });
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(503).json({
        error: 'No response received from Google API. Service may be unavailable.'
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      return res.status(500).json({
        error: `Error: ${error.message}`
      });
    }
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});