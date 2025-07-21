// API utility functions with proper error handling
export const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if response has content
    const text = await response.text();
    
    // If no content, return null
    if (!text) {
      return null;
    }

    // Try to parse JSON
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text:', text);
      throw new Error('Invalid JSON response from server');
    }
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Wrapper for GET requests
export const apiGet = (url) => apiRequest(url);

// Wrapper for POST requests
export const apiPost = (url, data) => 
  apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });

// Wrapper for PUT requests
export const apiPut = (url, data) => 
  apiRequest(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

// Wrapper for DELETE requests
export const apiDelete = (url) => 
  apiRequest(url, {
    method: 'DELETE',
  });