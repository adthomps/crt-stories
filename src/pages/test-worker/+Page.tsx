import React from 'react';

export default function TestWorkerPage() {
  console.log('[TestWorkerPage] Component rendered');
  return (
    <div style={{ padding: '2rem', background: '#ffcccc' }}>
      <h1>Test Worker Page</h1>
      <p>This is a test route to verify routing is working.</p>
      <p>If you see this at /test-worker, routing works.</p>
    </div>
  );
}