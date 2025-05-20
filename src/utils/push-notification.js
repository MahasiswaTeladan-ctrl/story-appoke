const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
const API_BASE_URL = 'https://story-api.dicoding.dev/v1';

class PushNotificationService {
  constructor() {
    this.serviceWorkerRegistration = null;
  }

  async init() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications are not supported');
      return false;
    }

    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/story-appoke/service-worker.js');
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  async requestNotificationPermission() {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async subscribeToPushNotification() {
    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      await this.sendSubscriptionToServer(subscription);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notification:', error);
      throw error;
    }
  }

  async unsubscribeFromPushNotification() {
    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await this.removeSubscriptionFromServer(subscription);
      }
    } catch (error) {
      console.error('Error unsubscribing from push notification:', error);
      throw error;
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async sendSubscriptionToServer(subscription) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User token not found. Please login first.');
      }

      const sub = subscription.toJSON ? subscription.toJSON() : subscription;
      if (!sub.keys || !sub.keys.p256dh || !sub.keys.auth) {
        throw new Error('Push subscription keys are missing. Please try again or check VAPID key.');
      }

      console.log('Sending subscription to server:', sub);
      console.log('Token:', token);

      const response = await fetch(`${API_BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
          },
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response content-type:', response.headers.get('content-type'));

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server did not return JSON. Status: ${response.status}. Response: ${text.substring(0, 200)}`);
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to subscribe for push notification');
      }
      const data = await response.json();
      console.log('Push subscription sent to server:', data);
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
      throw error;
    }
  }

  async removeSubscriptionFromServer(subscription) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User token not found. Please login first.');
      }
      const sub = subscription.toJSON ? subscription.toJSON() : subscription;
      const response = await fetch(`${API_BASE_URL}/notifications/subscribe`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: sub.endpoint,
        }),
      });
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server did not return JSON. Status: ${response.status}. Response: ${text.substring(0, 200)}`);
      }
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to unsubscribe from push notification');
      }
      const data = await response.json();
      console.log('Push unsubscription sent to server:', data);
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
      throw error;
    }
  }
}

export const pushNotificationService = new PushNotificationService(); 