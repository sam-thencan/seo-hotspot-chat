# SEO Hotspot Chat

A Node.js backend proxy server with React frontend for generating SEO-optimized titles and meta descriptions using Google's Gemini API.

## Overview

This application serves as an intermediary between the user and the Google Gemini API. It:

- Provides a user-friendly React interface for inputting business information
- Securely forwards requests to the Google Gemini API
- Generates SEO-optimized titles and meta descriptions
- Handles errors and edge cases

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Google Gemini API key

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

### Running the Application

Development mode (with auto-restart on file changes):
```
npm run dev
```

Production mode:
```
npm start
```

Build the React frontend:
```
npm run build
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

## Frontend Features

- Clean, modern UI built with React
- Secure API key handling (stored only in sessionStorage)
- Real-time chat interface
- Markdown rendering for formatted responses
- Copy-to-clipboard functionality
- Responsive design

## Security Considerations

- The user's API key is not stored on the server
- The key is only used for the current request and then discarded
- CORS is configured to allow requests only from authorized origins

CRITICAL SECURITY NOTE: This application transmits API keys from the client to the server. It is ESSENTIAL that this application, in any production or publicly accessible environment, is deployed and served exclusively over HTTPS to protect API keys from interception.

### API Key Storage in Frontend
The application currently stores the Google Gemini API key in `sessionStorage`. While this is convenient for development and means the key is automatically cleared when the browser tab/session is closed, it's important to understand the risks:
- **XSS Vulnerability Risk**: If the application has any Cross-Site Scripting (XSS) vulnerabilities, malicious scripts injected into the page could access and steal the API key from `sessionStorage`.
- **No Expiry**: Keys in `sessionStorage` persist for the duration of the session.

### Future Security Enhancements
For more robust security, especially in production or shared environments, consider the following improvements:
- **Backend-Restricted Key Usage**: Instead of the client sending the API key with each request, the API key could be stored securely on the backend (e.g., as an environment variable or in a secure vault). The backend would then make requests to the Gemini API on behalf of the user. This significantly reduces the risk of key exposure.
- **Short-Lived Tokens**: Implement an authentication system where the client authenticates with the backend, and the backend issues a short-lived session token. This token is then used for API requests, not the raw API key.
- **Dedicated API Gateway**: Use an API Gateway (like AWS API Gateway, Azure API Management, or a self-hosted one like Kong or Tyk). The gateway can handle API key management, rate limiting, and authentication, abstracting these concerns from the main application.
- **Stricter Content Security Policy (CSP)**: Implement a strong CSP to help mitigate XSS risks by controlling which scripts are allowed to run on the page.

## Deployment

The application can be deployed using various services:

### Backend Deployment Options
- Render.com (Free tier available)
- Fly.io (Free tier available)
- Railway.app (Free tier with credits)
- Heroku (Paid)

### Frontend Deployment Options
- Netlify (Free tier available)
- Vercel (Free tier available)
- GitHub Pages (Free)
- Cloudflare Pages (Free tier available)
