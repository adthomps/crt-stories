// Utility to check worker admin authentication (client-side)
export function isWorkerAdmin() {
  console.log('[isWorkerAdmin] Called');
  if (typeof document === 'undefined') {
    console.log('[isWorkerAdmin] No document (SSR), returning false');
    // SSR: cannot check cookie, assume not authenticated
    return false;
  }
  const cookies = document.cookie;
  console.log('[isWorkerAdmin] Document cookies:', cookies);
  const hasAdminCookie = cookies.includes('worker_admin=1');
  console.log('[isWorkerAdmin] Has admin cookie:', hasAdminCookie);
  return hasAdminCookie;
}
