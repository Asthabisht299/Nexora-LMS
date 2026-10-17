
const API_URL = 'http://localhost:5000/api/auth';

// Register a new user
export async function registerUser(userData) {
  return sendRequest('/register', userData);
}

// Log in an existing user
export async function loginUser(credentials) {
  return sendRequest('/login', credentials);
}

// Send data to the backend
async function sendRequest(endpoint, data) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Something went wrong');
  }

  return result;
}
