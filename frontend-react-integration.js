// This file demonstrates how to modify the existing React app to use the backend proxy
// Replace the handleSendMessage function in the provided React App.js with this version

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
  // Update this URL to match your backend deployment
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
      // Handle empty/blocked response cases
      setError("Received an empty response from the server.");
      setMessages(prevMessages => prevMessages.slice(0, -1));
    }

  } catch (err) {
    console.error("API Call failed:", err);
    setError(`Error: ${err.message || "Failed to get response from the server."}`);
    // Remove the user message if the request failed
    setMessages(prevMessages => prevMessages.slice(0, -1));
  } finally {
    setIsLoading(false);
  }
}, [currentMessage, isLoading, isConfigSet, messages, apiKey]);