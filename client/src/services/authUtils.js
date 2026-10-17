
export function getCurrentUser() {
  try {
    const user = localStorage.getItem('nexora_user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function getAuthToken() {
  return localStorage.getItem('nexora_token');
}

export function isLoggedIn() {
  return Boolean(getAuthToken() && getCurrentUser());
}

export function logoutUser() {
  localStorage.removeItem('nexora_token');
  localStorage.removeItem('nexora_user');

  window.location.href = '/login';
}
