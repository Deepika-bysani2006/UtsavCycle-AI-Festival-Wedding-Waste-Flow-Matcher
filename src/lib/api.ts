import type { UserProfile } from '../types';

export function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3001';
    }
  }
  return '';
}

export async function syncUserToMongoDB(profile: UserProfile): Promise<void> {
  try {
    const url = `${getApiBaseUrl()}/api/users/sync`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: profile.uid,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        photoURL: profile.photoURL || '',
      }),
    });
  } catch (err) {
    console.warn('[MongoDB Sync] User sync warning:', err);
  }
}

export async function syncEventToMongoDB(eventData: Record<string, any>): Promise<void> {
  try {
    const url = `${getApiBaseUrl()}/api/events`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
  } catch (err) {
    console.warn('[MongoDB Sync] Event sync warning:', err);
  }
}

export async function syncPickupToMongoDB(pickupData: Record<string, any>): Promise<void> {
  try {
    const url = `${getApiBaseUrl()}/api/pickups`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pickupData),
    });
  } catch (err) {
    console.warn('[MongoDB Sync] Pickup sync warning:', err);
  }
}

export async function updatePickupStatusInMongoDB(pickupId: string, status: string): Promise<void> {
  try {
    const url = `${getApiBaseUrl()}/api/pickups/${pickupId}/status`;
    await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  } catch (err) {
    console.warn('[MongoDB Sync] Pickup status update warning:', err);
  }
}
