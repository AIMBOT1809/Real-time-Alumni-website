const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

function getHeaders(userId: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-user-id': userId,
  };
}

// ── Connection Requests ──

export async function sendConnectionRequest(userId: string, receiverId: string) {
  const res = await fetch(`${API_BASE}/requests`, {
    method: 'POST',
    headers: getHeaders(userId),
    body: JSON.stringify({ receiverId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to send request');
  }
  return res.json();
}

export async function getIncomingRequests(userId: string) {
  const res = await fetch(`${API_BASE}/requests/incoming`, {
    headers: getHeaders(userId),
  });
  return res.json();
}

export async function getOutgoingRequests(userId: string) {
  const res = await fetch(`${API_BASE}/requests/outgoing`, {
    headers: getHeaders(userId),
  });
  return res.json();
}

export async function respondToRequest(userId: string, requestId: string, action: 'accept' | 'decline') {
  const res = await fetch(`${API_BASE}/requests/${requestId}`, {
    method: 'PATCH',
    headers: getHeaders(userId),
    body: JSON.stringify({ action }),
  });
  return res.json();
}

// ── Conversations ──

export async function getConversations(userId: string) {
  const res = await fetch(`${API_BASE}/conversations`, {
    headers: getHeaders(userId),
  });
  return res.json();
}

export async function getMessages(userId: string, conversationId: string, before?: string) {
  const params = new URLSearchParams({ limit: '50' });
  if (before) params.set('before', before);

  const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages?${params}`, {
    headers: getHeaders(userId),
  });
  return res.json();
}

export async function sendMessageRest(userId: string, conversationId: string, text: string) {
  const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: getHeaders(userId),
    body: JSON.stringify({ text }),
  });
  return res.json();
}

export async function markConversationRead(userId: string, conversationId: string) {
  const res = await fetch(`${API_BASE}/conversations/${conversationId}/read`, {
    method: 'PATCH',
    headers: getHeaders(userId),
  });
  return res.json();
}
