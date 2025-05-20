import HomePagePresenter from '../presenters/home-presenter.js';
import './story-item.js';
import { pushNotificationService } from '../utils/push-notification.js';

const HomePage = {
  async render() {
    return `
      <div class="page-container">
        <div class="notification-settings">
          <h2>Notification Settings</h2>
          <button id="enable-notification" class="button">Subscribe Push Notifications</button>
          <button id="disable-notification" class="button" style="display: none;">Unsubscribe Push Notifications</button>
          <p id="notification-status"></p>
        </div>
        <h2>Daftar Cerita</h2>
        <div class="story-list" id="story-list"></div>
        <div id="map" style="width: 100%; height: 400px;"></div>
        <div id="offline-message" style="display:none; color:#e74c3c; text-align:center; margin-top:1rem;">Kamu sedang offline. Data yang tampil adalah data terakhir yang tersimpan.</div>
      </div>
    `;
  },

  async afterRender() {
    console.log('HomePage afterRender dipanggil');
    try {
      const stories = await HomePagePresenter.loadStories();
      console.log('HomePagePresenter.loadStories selesai, jumlah:', stories.length);
      const listContainer = document.getElementById('story-list');
      const mapContainer = document.getElementById('map');
      const offlineMsg = document.getElementById('offline-message');
      
      listContainer.innerHTML = '';

      this._initMap(mapContainer);

      requestAnimationFrame(() => {
        this.map.invalidateSize();
      });

      if (stories.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; color:#888;">Tidak ada cerita yang bisa ditampilkan.</p>';
      } else {
        stories.forEach((story) => {
          const storyItem = document.createElement('story-item');
          storyItem.story = story;
          listContainer.appendChild(storyItem);
          this._addMarkerToMap(story);
        });
      }

      if (!navigator.onLine) {
        offlineMsg.style.display = 'block';
      }

      const enableButton = document.getElementById('enable-notification');
      const disableButton = document.getElementById('disable-notification');
      const statusText = document.getElementById('notification-status');

      const isSupported = await pushNotificationService.init();
      if (!isSupported) {
        statusText.textContent = 'Push notifications are not supported in your browser';
        enableButton.style.display = 'none';
        return;
      }

      const subscription = await pushNotificationService.serviceWorkerRegistration.pushManager.getSubscription();
      if (subscription) {
        enableButton.style.display = 'none';
        disableButton.style.display = 'block';
        statusText.textContent = 'Push notifications are enabled';
      }

      enableButton.addEventListener('click', async () => {
        try {
          const permissionGranted = await pushNotificationService.requestNotificationPermission();
          if (permissionGranted) {
            await pushNotificationService.subscribeToPushNotification();
            enableButton.style.display = 'none';
            disableButton.style.display = 'block';
            statusText.textContent = 'Push notifications are enabled';
          } else {
            statusText.textContent = 'Permission denied for push notifications';
          }
        } catch (error) {
          console.error('Error enabling push notifications:', error);
          statusText.textContent = 'Error enabling push notifications';
        }
      });

      disableButton.addEventListener('click', async () => {
        try {
          await pushNotificationService.unsubscribeFromPushNotification();
          enableButton.style.display = 'block';
          disableButton.style.display = 'none';
          statusText.textContent = 'Push notifications are disabled';
        } catch (error) {
          console.error('Error disabling push notifications:', error);
          statusText.textContent = 'Error disabling push notifications';
        }
      });
    } catch (error) {
      console.error('Error in HomePage afterRender:', error);
      document.getElementById('story-list').innerHTML = '<p style="text-align:center; color:#e74c3c;">Gagal memuat cerita. Cek koneksi internet kamu.</p>';
      document.getElementById('offline-message').style.display = 'block';
    }
  },

  _initMap(mapContainer) {
    if (this.map) {
      this.map.remove(); 
      this.map = null;
    }

    this.map = L.map(mapContainer).setView([-6.200000, 106.816666], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  },

  _addMarkerToMap(story) {
    const { lat, lon } = story;
  
    if (lat && lon) {
      const markerIcon = L.divIcon({
        className: 'emoji-marker',
        html: '📍',
        iconSize: [30, 30],
      });

      const marker = L.marker([lat, lon], { icon: markerIcon }).addTo(this.map);

      marker.bindPopup(
        `<strong>${story.name}</strong><br>
         ${story.description}<br>
         Dibuat pada: ${new Date(story.createdAt).toLocaleDateString()}<br>
         Lokasi: Lat: ${lat}, Lon: ${lon}<br>`
      );
    }
  }
};

export default HomePage;