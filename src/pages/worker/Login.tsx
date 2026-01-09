import React, { useState } from 'react';

export default function WorkerLogin() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSendLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/worker/send-magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) {
      setStep('code');
      setMessage('A login code has been sent to your email.');
    } else {
      setMessage(data.error || 'Failed to send code.');
    }
    setLoading(false);
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const res = await fetch('/api/worker/verify-magic-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    if (res.ok) {
      window.location.href = '/worker/dashboard';
    } else {
      const data = await res.json();
      if (data.error && data.error.toLowerCase().includes('expired')) {
        setMessage('Session expired or code expired. Please request a new code.');
        setStep('email');
      } else {
        setMessage(data.error || 'Invalid code.');
      }
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001' }}>
      <h2>Worker Admin Login</h2>
      {step === 'email' && (
        <form onSubmit={handleSendLink}>
          <label>Email:<br />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', marginBottom: 12 }} />
          </label>
          <button type="submit" disabled={loading} style={{ width: '100%' }}>Send Login Code</button>
        </form>
      )}
      {step === 'code' && (
        <form onSubmit={handleVerifyCode}>
          <label>Enter Code:<br />
            <input type="text" value={code} onChange={e => setCode(e.target.value)} required style={{ width: '100%', marginBottom: 12 }} />
          </label>
          <button type="submit" disabled={loading} style={{ width: '100%' }}>Verify & Login</button>
        </form>
      )}
      {message && <p style={{ color: '#c00', marginTop: 16 }}>{message}</p>}
    </div>
  );
}
