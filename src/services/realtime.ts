import { io, Socket } from 'socket.io-client';
import { invalidateApiCache } from './api';

// ── Real-time channel ────────────────────────────────────────────────────────
// The backend already broadcasts hospital events (patient:admitted,
// patient:updated, patient:discharged, bed:updated, note:added, billing:paid)
// over Socket.IO. Until now no client ever connected, so every cross-role
// change silently required a manual page refresh. This module owns that single
// connection and exposes a subscribe() helper with automatic teardown.

const TOKEN_KEYS = ['chaudhary_jwt_token', 'auth_token'];

function readToken(): string | null {
  for (const key of TOKEN_KEYS) {
    const value = window.localStorage.getItem(key);
    if (value) return value;
  }
  return null;
}

let socket: Socket | null = null;

// Tracks active subscriptions so the shared socket is only torn down once the
// final listener detaches (the Socket type in this client build has no
// listenerCount(), so we maintain the count ourselves).
const liveListeners = new Set<object>();

/** The event names the backend is known to emit. */
export const HMS_EVENTS = [
  'patient:admitted',
  'patient:updated',
  'patient:discharged',
  'bed:updated',
  'note:added',
  'billing:paid',
  'user:approved',
  'settings:updated',
  'doctor:updated',
  'user:billing-access-changed',
  'user:updated',
] as const;

export type HmsEvent = (typeof HMS_EVENTS)[number];

function ensureSocket(): Socket | null {
  // Guard for non-browser render targets.
  if (typeof window === 'undefined') return null;

  const token = readToken();
  if (!token) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  if (socket) {
    // Re-authenticate if the user logged in/out since the socket was created.
    const authed = (socket.auth as { token?: string } | undefined)?.token;
    if (authed !== token) {
      socket.disconnect();
      socket = null;
    } else {
      return socket;
    }
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || '';
  const socketOrigin = apiBase && apiBase.startsWith('http')
    ? new URL(apiBase).origin
    : undefined;

  socket = io(socketOrigin, {
    // Same origin as /api so the Vite dev proxy and any production reverse
    // proxy both route it without extra configuration.
    path: '/socket.io',
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1500,
    reconnectionDelayMax: 10000,
    auth: { token },
  });

  socket.on('connect_error', (err: any) => {
    const msg = String(err?.message || '').toLowerCase();
    if (msg.includes('unauthorized') || msg.includes('token')) {
      console.warn('[Socket.IO] Handshake unauthorized — stopping reconnect:', err.message);
      socket?.disconnect();
      socket = null;
    }
  });

  // Automatically flush stale cached API data when real-time hospital events arrive
  HMS_EVENTS.forEach((ev) => {
    socket!.on(ev, () => {
      if (ev.startsWith('patient:')) {
        invalidateApiCache('patients');
        invalidateApiCache('beds');
        invalidateApiCache('discharge');
        invalidateApiCache('records');
      } else if (ev === 'bed:updated') {
        invalidateApiCache('beds');
        invalidateApiCache('patients');
      } else if (ev === 'billing:paid') {
        invalidateApiCache('billing');
        invalidateApiCache('patients');
        invalidateApiCache('records');
      } else if (ev.startsWith('user:')) {
        invalidateApiCache('users');
      } else if (ev === 'note:added') {
        invalidateApiCache('notes');
      }
    });
  });

  return socket;
}

/**
 * Subscribe to a backend event. Returns an unsubscribe function that also
 * drops the connection entirely when the last listener goes away, so a
 * portal that unmounts does not leave a socket polling in the background.
 */
export function subscribeToHmsEvent<T = any>(
  event: HmsEvent,
  handler: (payload: T) => void
): () => void {
  const s = ensureSocket();
  if (!s) return () => {};

  const entry = { event, handler };
  liveListeners.add(entry);
  s.on(event, handler as (...args: any[]) => void);

  return () => {
    s.off(event, handler as (...args: any[]) => void);
    liveListeners.delete(entry);
    // No remaining listeners -> release the connection.
    if (liveListeners.size === 0) {
      s.disconnect();
      socket = null;
    }
  };
}

/** Force a clean disconnect (called on sign-out). */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

