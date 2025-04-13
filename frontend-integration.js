// This file demonstrates how to modify the existing React app to use the backend proxy
// Replace the handleSendMessage function in App.js with this version

const handleSendMessage = useCallback(async () => {
  if (!currentMessage.trim() || isLoading || !isConfigSet) return;

  const newMessage = { role: 'user', content: currentMessage };
  const updatedMessages = [...messages, newMessage];
  setMessages(updatedMessages);
  setCurrentMessage('');
  setIsLoading(true);
  setError(null); // Clear previous errors before sending

  // Store API key for use in the request
  const API_KEY = apiKey;
  
  // Use the backend proxy URL instead of directly calling Google API
  const PROXY_URL = 'http://localhost:3001/api/chat';

  try {
    // Send request to our backend proxy instead of directly to Google
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: updatedMessages,
        userApiKey: API_KEY
      }),
    });

    if (!response.ok) {
      let errorData;
      try { errorData = await response.json(); } catch (parseError) { /* ignore */ }
      const errorMessage = errorData?.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Extract the assistant's message from our proxy response
    const assistantResponse = data.message;

    if (assistantResponse) {
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: assistantResponse }]);
    } else {
      setError("Received an empty response from the server.");
    }

  } catch (err) {
    console.error("API Call failed:", err);
    setError(`Error: ${err.message || "Failed to get response from the server."}`);
  } finally {
    setIsLoading(false);
  }
}, [currentMessage, isLoading, isConfigSet, messages, apiKey]);

// Export for reference
export default handleSendMessage;