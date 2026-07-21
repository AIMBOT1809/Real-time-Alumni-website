const API_BASE = '/api';

import { supabase } from '../../supabaseClient';

async function getHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
  };
}

// ── Connection Requests ──

export async function sendConnectionRequest(receiverId: string) {
  const res = await fetch(`${API_BASE}/requests`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ receiverId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to send request');
  }
  return res.json();
}

export async function getIncomingRequests() {
  const res = await fetch(`${API_BASE}/requests/incoming`, {
    headers: await getHeaders(),
  });
  return res.json();
}

export async function getOutgoingRequests() {
  const res = await fetch(`${API_BASE}/requests/outgoing`, {
    headers: await getHeaders(),
  });
  return res.json();
}

export async function respondToRequest(requestId: string, action: 'accept' | 'decline') {
  const res = await fetch(`${API_BASE}/requests/${requestId}`, {
    method: 'PATCH',
    headers: await getHeaders(),
    body: JSON.stringify({ action }),
  });
  return res.json();
}

// ── Conversations ──

export async function getConversations() {
  const res = await fetch(`${API_BASE}/conversations`, {
    headers: await getHeaders(),
  });
  return res.json();
}

export async function getMessages(conversationId: string, before?: string) {
  const params = new URLSearchParams({ limit: '50' });
  if (before) params.set('before', before);

  const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages?${params}`, {
    headers: await getHeaders(),
  });
  return res.json();
}

export async function sendMessageRest(conversationId: string, text: string) {
  const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ text }),
  });
  return res.json();
}

export async function markConversationRead(conversationId: string) {
  const res = await fetch(`${API_BASE}/conversations/${conversationId}/read`, {
    method: 'PATCH',
    headers: await getHeaders(),
  });
  return res.json();
}
