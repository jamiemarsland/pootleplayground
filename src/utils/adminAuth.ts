const ADMIN_SESSION_KEY = 'admin_authenticated';
const ADMIN_SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

export function checkAdminPassword(password: string): boolean {
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
  return password === adminPassword;
}

export function setAdminSession(): void {
  const expiresAt = Date.now() + ADMIN_SESSION_DURATION;
  sessionStorage.setItem(ADMIN_SESSION_KEY, expiresAt.toString());
}

export function isAdminAuthenticated(): boolean {
  const expiresAt = sessionStorage.getItem(ADMIN_SESSION_KEY);
  if (!expiresAt) return false;

  const now = Date.now();
  if (now > parseInt(expiresAt)) {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    return false;
  }

  return true;
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export function promptAdminPassword(): boolean {
  const password = prompt('Enter admin password to access admin features:');
  if (!password) return false;

  if (checkAdminPassword(password)) {
    setAdminSession();
    return true;
  } else {
    alert('Incorrect password. Admin access denied.');
    return false;
  }
}
