import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, RotateCcw, PlusCircle, AlertCircle, Loader2, Copy } from 'lucide-react';
import './App.css';

// --- Simple Markdown Renderer Component (Placeholder) ---
const SimpleMarkdownRenderer = ({ content }) => {
  // Handles basic markdown rendering
  if (typeof content !== 'string') {
    return <div className="text-sm whitespace-pre-wrap"></div>;
  }
  let html = content
    .replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<strong>$1$2</strong>')
    .replace(/\*(.*?)\*|_(.*?)_/g, '<em>$1$2</em>')
    .replace(/^([*]|-) (.*$)/gm, '<li>$2</li>');
  if (html.includes('<li>')) {
      html = html.replace(/(?:^|\n)((?:<li>.*?<\/li>\s*)+)/g, (match, p1) => `\n<ul>\n${p1}</ul>\n`);
  }
  return <div className="text-sm whitespace-pre-wrap prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
};

// --- Helper function (formatMessagesForGemini) is NO LONGER NEEDED here ---
// Formatting happens on the backend now.

// --- Hardcoded System Prompt is NO LONGER NEEDED here ---
// It's defined in server.js

// --- Fixed Model Name is NO LONGER NEEDED here ---
// It's defined in server.js
const DISPLAY_MODEL_NAME = 'gemini-2.0-flash'; // For display purposes only


// --- Main App Component ---
function App() {
  // State variables
  const [apiKey, setApiKey] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConfigSet, setIsConfigSet] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messagesEndRef = useRef(null);

  // Backend API URL (adjust if needed, especially for production)
  // Using a relative path assumes the frontend is served from the same origin
  // or a proxy is set up in development/production.
  // Alternatively, use process.env.REACT_APP_BACKEND_URL or the full URL.
  const BACKEND_API_URL = '/api/chat';

  // Effect to load config from sessionStorage
  useEffect(() => {
    const storedApiKey = sessionStorage.getItem('geminiApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setIsConfigSet(true);
      setError(null);
    }
  }, []);

  // Effect to scroll to the bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handlers
  const handleStartChat = () => {
    if (!apiKey.trim()) { setError("API Key is required."); return; }
    sessionStorage.setItem('geminiApiKey', apiKey);
    setIsConfigSet(true);
    setMessages([]);
    setError(null);
  };

  // Updated to call the backend proxy
  const handleSendMessage = useCallback(async () => {
    if (!currentMessage.trim() || isLoading || !isConfigSet) return;

    const newMessage = { role: 'user', content: currentMessage };
    // Send the current message history PLUS the new user message
    const updatedMessages = [...messages, newMessage];
    // Optimistically update UI
    setMessages(updatedMessages);
    setCurrentMessage('');
    setIsLoading(true);
    setError(null); // Clear previous errors before sending

    try {
      // Call the backend proxy endpoint
      const response = await fetch(BACKEND_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send the message history and the user's API key
        body: JSON.stringify({
            messages: updatedMessages, // Send the full history including the latest user message
            userApiKey: apiKey // Send the API key from state
         }),
      });

      // Check if the response from the *backend* is ok
      if (!response.ok) {
        let errorData;
        try {
            // Try to parse error message from backend
            errorData = await response.json();
        } catch (parseError) {
            // Fallback if backend response isn't JSON
             errorData = { error: `Backend server error: ${response.status}` };
        }
        // Throw error with message from backend or status code
        throw new Error(errorData?.error || `Backend error: ${response.status}`);
      }

      // Parse the successful response from the backend
      const data = await response.json();

      // Expecting backend to return { message: "assistant response text" }
      const assistantResponse = data?.message;

      if (assistantResponse) {
        // Add only the assistant response to the message list
        setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: assistantResponse }]);
      } else {
        // Handle cases where backend response format is unexpected
        setError("Received an unexpected response format from the backend server.");
         // Revert optimistic UI update if backend response is bad
        setMessages(prevMessages => prevMessages.slice(0, -1));
      }

    } catch (err) {
      console.error("API Call via proxy failed:", err);
      setError(`Error: ${err.message || "Failed to get response."}`);
      // Revert optimistic UI update on error
      setMessages(prevMessages => prevMessages.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  // API Key is now needed in dependency array as it's sent in the request
  }, [currentMessage, isLoading, isConfigSet, messages, apiKey, BACKEND_API_URL]);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setError(null); // Clear errors on new chat
    setCurrentMessage('');
  };

  const handleReset = () => {
    setApiKey('');
    setMessages([]);
    setCurrentMessage('');
    setError(null);
    setIsConfigSet(false);
    sessionStorage.removeItem('geminiApiKey');
  };

  // Updated Copy Button Handler with Error Feedback
  const copyToClipboard = (text, index) => {
    if (!navigator.clipboard) {
        setError("Clipboard API not available. Please use HTTPS or localhost.");
        setTimeout(() => setError(null), 3000);
        return;
    }
    navigator.clipboard.writeText(text).then(() => {
        setCopiedIndex(index);
        setError(null);
        setTimeout(() => setCopiedIndex(null), 1500);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        setError("Failed to copy message. Browser might have blocked it.");
        setTimeout(() => setError(null), 3000);
    });
  };


  // --- Render Logic ---
  // Setup Form
  if (!isConfigSet) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4 font-sans">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Local SEO Chat - SEO Hotspot Edition</h1>
          <p className="text-sm text-gray-600 mb-4 text-center">Enter your API key to start chatting.</p>
          {error && ( <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md flex items-center"> <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" /> <span>{error}</span> </div> )}
          <div className="mb-6">
             <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">Gemini API Key</label>
             <input type="password" id="apiKey" value={apiKey} onChange={(e) => { setApiKey(e.target.value); setError(null); }} placeholder="Enter your Gemini API key" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" required />
          </div>
          <button onClick={handleStartChat} disabled={!apiKey.trim()} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center" > Start Chat </button>
          <p className="text-xs text-gray-500 mt-4 text-center"> API Key stored in sessionStorage (potentially unsafe). </p>
        </div>
      </div>
    );
  }

  // Chat Interface
  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center border-b border-gray-200">
        <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-gray-800 leading-tight">Local SEO Chat</h1>
            {/* Display model name used by backend */}
            <span className="text-xs text-gray-500">SEO Hotspot Edition ({DISPLAY_MODEL_NAME})</span>
        </div>
        <div className="flex space-x-2">
            <button onClick={handleNewChat} title="Start New Chat" className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition duration-150" > <PlusCircle size={20} /> </button>
            <button onClick={handleReset} title="Reset Settings & New Chat" className="p-2 rounded-full text-red-500 hover:bg-red-100 hover:text-red-700 transition duration-150" > <RotateCcw size={20} /> </button>
        </div>
       </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-blue-50 to-purple-50">
        {error && !isLoading && (
            <div className="flex justify-center sticky top-2 z-10">
                 <div className="mt-2 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center text-sm max-w-md shadow-lg">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                 </div>
            </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`flex group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`relative max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl shadow-md ${ msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-200' }`} >
              {msg.role === 'assistant' ? ( <SimpleMarkdownRenderer content={msg.content} /> ) : ( <p className="text-sm whitespace-pre-wrap">{msg.content}</p> )}
              {msg.role === 'assistant' && ( <button onClick={() => copyToClipboard(msg.content, index)} title="Copy message" className={`absolute -top-2 -right-2 p-1 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${copiedIndex === index ? 'bg-green-500 text-white' : ''}`} > <Copy size={14} /> </button> )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
        {isLoading && ( <div className="flex justify-center items-center py-2"> <Loader2 className="w-6 h-6 text-blue-500 animate-spin" /> <span className="ml-2 text-sm text-gray-600">Assistant is thinking...</span> </div> )}
      </div>
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-2">
            <textarea value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Briefly describe the type of business you have and its location" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition" rows="1" style={{ minHeight: '40px', maxHeight: '120px' }} disabled={isLoading} />
            <button onClick={handleSendMessage} disabled={isLoading || !currentMessage.trim()} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed" title="Send Message" > <Send size={20} /> </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">Local SEO Chat can make mistakes, double-check important results.</p>
      </div>
    </div>
  );
}

export default App;