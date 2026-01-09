// Utility to check worker admin authentication (client-side)
export function isWorkerAdmin() {
  if (typeof document === 'undefined') {
    // SSR: cannot check cookie, assume not authenticated
    return false;
  }
  return document.cookie.includes('worker_admin=1');
}
