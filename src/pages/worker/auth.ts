// Utility to check worker admin authentication (client-side)
export function isWorkerAdmin() {
  return document.cookie.includes('worker_admin=1');
}
