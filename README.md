# OptiTitle Backend Proxy

A Node.js backend proxy server for the OptiTitle application that securely forwards requests to the Google Gemini API.

## Overview

This backend proxy serves as an intermediary between the OptiTitle frontend and the Google Gemini API. It:

- Receives requests from the frontend containing messages and the user's API key
- Forwards these requests to the Google Gemini API
- Returns the responses back to the frontend
- Handles errors and edge cases

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory (optional, defaults are provided):
   ```
   PORT=3001
   ```

### Running the Server

Development mode (with auto-restart on file changes):
```
npm run dev
```

Production mode:
```
npm start
```

## API Documentation

### POST /api/chat

Processes chat messages and forwards them to the Google Gemini API.

#### Request Body

```json
{
  "messages": [
    {
      "role": "user",
      "content": "We offer professional plumbing services in Bend, OR."
    }
  ],
  "userApiKey": "YOUR_GOOGLE_GEMINI_API_KEY"
}
```

- `messages`: Array of message objects with `role` ("user" or "assistant") and `content` (string)
- `userApiKey`: The user's Google Gemini API key (not stored on the server)

#### Response

Success (200 OK):
```json
{
  "message": "**SEO Title**: Top Plumbing in Bend, Oregon\n**Character Count**: 56\n**Meta Description**: Need a plumber in Bend, Oregon? Get reliable, fast plumbing services today!\n**Character Count**: 142\n\nWould you like to see other variations of the SEO Title or Meta Description?"
}
```

Error (400/500):
```json
{
  "error": "Error message details"
}
```

## Frontend Integration

Update the frontend code to use the proxy API instead of directly calling the Google Gemini API:

```javascript
// Replace direct API call:
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${FIXED_MODEL_NAME}:generateContent?key=${API_KEY}`;

// With proxy API call:
const PROXY_URL = 'http://localhost:3001/api/chat';

// And update the fetch call:
const response = await fetch(PROXY_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: updatedMessages,
    userApiKey: apiKey
  }),
});

// Then extract the message from the response:
const data = await response.json();
if (data.error) {
  throw new Error(data.error);
}
const assistantResponse = data.message;
```

## Security Considerations

- The user's API key is not stored on the server
- The key is only used for the current request and then discarded
- CORS is configured to allow requests only from authorized origins