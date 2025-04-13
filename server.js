// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Using node-fetch v2 for CommonJS

// --- Configuration ---
const app = express();
const PORT = process.env.PORT || 3001; // Use port from .env or default to 3001
const GOOGLE_API_URL_BASE = process.env.GOOGLE_API_URL_BASE || 'https://generativelanguage.googleapis.com/v1beta/models';

// --- Hardcoded System Prompt (should match frontend) ---
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

// --- Fixed Model Name (should match frontend) ---
const FIXED_MODEL_NAME = 'gemini-2.0-flash';

// --- Middleware ---
// Enable CORS for all origins (adjust for production)
app.use(cors());
// Parse JSON request bodies
app.use(express.json());
// Serve static files from the React app's build directory
app.use(express.static('build'));

// --- Helper function to format messages for Google API ---
// (This assumes the frontend sends messages in the { role: 'user'/'assistant', content: '...' } format)
const formatMessagesForGoogle = (messages) => {
    const contents = [];
    messages.forEach(msg => {
        // Ensure roles are 'user' or 'model'
        if (msg.role === 'user' || msg.role === 'assistant') {
            contents.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            });
        }
    });
    return contents;
};


// --- API Endpoint ---
app.post('/api/chat', async (req, res) => {
    console.log("Received request on /api/chat"); // Log incoming requests

    // Extract messages and userApiKey from the request body sent by the frontend
    const { messages, userApiKey } = req.body;

    // Basic validation
    if (!userApiKey) {
        console.error("Error: Missing userApiKey in request body");
        return res.status(400).json({ error: 'Missing API Key in request' });
    }
    if (!messages || !Array.isArray(messages)) {
         console.error("Error: Missing or invalid messages array in request body");
        return res.status(400).json({ error: 'Missing or invalid messages array' });
    }

    // Construct the URL for the Google API call
    const googleApiUrl = `${GOOGLE_API_URL_BASE}/${FIXED_MODEL_NAME}:generateContent?key=${userApiKey}`;

    // Format messages for the Google API
    const apiContents = formatMessagesForGoogle(messages);

    // Construct the request body for the Google API
    const googleRequestBody = {
        contents: apiContents,
        systemInstruction: {
            parts: [{ text: HARDCODED_SYSTEM_PROMPT }]
        },
        // Add safetySettings or generationConfig if needed
        // generationConfig: { temperature: 0.7 },
        // safetySettings: [{ category: "HARM_CATEGORY_...", threshold: "BLOCK_..."}]
    };

    console.log(`Sending request to Google API: ${googleApiUrl}`);
    // Do NOT log googleRequestBody if it contains sensitive info in messages

    try {
        const googleResponse = await fetch(googleApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(googleRequestBody),
        });

        // Check if the response from Google is ok
        if (!googleResponse.ok) {
            let errorData;
            try {
                errorData = await googleResponse.json();
                console.error("Google API Error Response:", errorData);
            } catch (parseError) {
                 console.error("Failed to parse Google API error response");
                 errorData = { error: { message: `Google API responded with status: ${googleResponse.status}` } };
            }
            const errorMessage = errorData?.error?.message || `Google API error: ${googleResponse.status}`;
            // Send the error back to the frontend client
            return res.status(googleResponse.status).json({ error: errorMessage });
        }

        // Parse the successful response from Google
        const data = await googleResponse.json();

        // Extract the assistant's response text
        // Added more robust checking
        const assistantResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (assistantResponseText) {
            // Send the successful response back to the frontend client
            console.log("Successfully received response from Google API.");
            res.json({ message: assistantResponseText });
        } else {
            // Handle cases where the response structure is unexpected or content was blocked
            console.warn("Google API response missing expected text content:", data);
            const blockReason = data?.promptFeedback?.blockReason;
            const finishReason = data?.candidates?.[0]?.finishReason;
            let specificError = "Received an empty or unexpected response format from the Google API.";
            if (blockReason) { specificError = `Response blocked by Google API due to: ${blockReason}.`; }
            else if (finishReason && finishReason !== 'STOP') { specificError = `Generation finished unexpectedly by Google API: ${finishReason}.`; }
            res.status(500).json({ error: specificError });
        }

    } catch (error) {
        // Handle network errors or other issues during the fetch call
        console.error("Error calling Google API:", error);
        res.status(500).json({ error: `Failed to communicate with Google API: ${error.message}` });
    }
});
// --- Serve React App ---
// For any request that doesn't match an API route, send the React app
app.get('/', (req, res) => {
    res.sendFile('build/index.html', { root: __dirname });
});


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Backend proxy server running on http://localhost:${PORT}`);
});
