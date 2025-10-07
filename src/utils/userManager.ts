export function getUserId(): string {
  let userId = localStorage.getItem('blueprint_user_id');

  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('blueprint_user_id', userId);
  }

  return userId;
}

export function clearUserId(): void {
  localStorage.removeItem('blueprint_user_id');
}
